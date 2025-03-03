import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./database";
import { JWT_SECRET, BCRYPT_SALT_ROUNDS } from "./config";

// Реєстрація 
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Вкажіть email та пароль" });
    }

    // Перевірка
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Користувач з таким email вже існує" });
    }

    // Хеш
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // new user БД
    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );

    // Токен
    const token = jwt.sign({ id: newUser.rows[0].id, email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({ message: "Користувач створений", token });
  } catch (error) {
    console.error("Помилка реєстрації:", error);
    return res.status(500).json({ message: "Помилка сервера" });
  }
};

// Логін
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Вкажіть email та пароль" });
    }

    // Пошук користувача за email
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Невірні облікові дані" });
    }

    const user = userResult.rows[0];

    // Перевірка паролю
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Невірні облікові дані" });
    }

    // JWT токен
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({ message: "Успішний вхід", token });
  } catch (error) {
    console.error("Помилка логінації:", error);
    return res.status(500).json({ message: "Помилка сервера" });
  }
};
