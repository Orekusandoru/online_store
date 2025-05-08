import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../database";
import { JWT_SECRET, BCRYPT_SALT_ROUNDS } from "../config";


export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Вкажіть email та пароль" });
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Користувач з таким email вже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Якщо роль не вказана, автоматично ставимо 'user'
    const userRole = role === "seller" ? "seller" : "user";

    const newUser = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, userRole]
    );

    const token = jwt.sign({ id: newUser.rows[0].id, email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({ message: "Користувач створений", token, role: userRole });
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

    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Невірні облікові дані" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Невірні облікові дані" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({ message: "Успішний вхід", token, role: user.role });
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