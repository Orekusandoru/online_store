import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../database";
import { JWT_SECRET, BCRYPT_SALT_ROUNDS } from "../config";
import nodemailer from "nodemailer";

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Вкажіть email та пароль" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Користувач з таким email вже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

   
    const userRole = role === "seller" ? "seller" : "user";

    const newUser = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, userRole]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, email, role: userRole }, 
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res
      .status(201)
      .json({ message: "Користувач створений", token, role: userRole });
  } catch (error) {
    console.error("Помилка реєстрації:", error);
    return res.status(500).json({ message: "Помилка сервера" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Вкажіть email та пароль" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Невірні облікові дані" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Невірні облікові дані" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res
      .status(200)
      .json({ message: "Успішний вхід", token, role: user.role });
  } catch (error) {
    console.error("Помилка логінації:", error);
    return res.status(500).json({ message: "Помилка сервера" });
  }
};

export const test = async (req: Request, res: Response): Promise<any> => {
  try {
    return res.status(200).json({ message: "Успішний вхід" });
  } catch (error) {
    console.error("Помилка логінації:", error);
    return res.status(500).json({ message: "Помилка сервера" });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Вкажіть email" });

  try {
    const userRes = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );
    if (!userRes.rows[0]) {

      return res.json({
        message: "Інструкції надіслано на email, якщо він зареєстрований.",
      });
    }
    const user = userRes.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, type: "reset" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${token}`;

  
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP налаштування не задані у .env");
      return res.status(500).json({ message: "Email не налаштовано на сервері" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "Скидання пароля",
      html: `<p>Для скидання пароля перейдіть за <a href="${resetLink}">цим посиланням</a>.<br/>Посилання дійсне 1 годину.</p>`,
    });

    res.json({
      message: "Інструкції надіслано на email, якщо він зареєстрований.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, password, oldPassword } = req.body;
  try {
    if (token) {
      let payload: any;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch {
        return res
          .status(400)
          .json({ message: "Недійсний або прострочений токен" });
      }
      if (!payload || !payload.id || payload.type !== "reset") {
        return res.status(400).json({ message: "Недійсний токен" });
      }
      const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
        hashed,
        payload.id,
      ]);
      return res.json({ message: "Пароль змінено" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Не авторизовано" });
    }
    if (!oldPassword || !password) {
      return res.status(400).json({ message: "Вкажіть старий і новий пароль" });
    }
    const userRes = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!userRes.rows[0])
      return res.status(404).json({ message: "Користувача не знайдено" });
    const isMatch = await bcrypt.compare(oldPassword, userRes.rows[0].password);
    if (!isMatch)
      return res.status(400).json({ message: "Старий пароль невірний" });
    const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashed,
      req.user.id,
    ]);
    res.json({ message: "Пароль змінено" });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};
