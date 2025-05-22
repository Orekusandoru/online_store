import { Request, Response } from "express";
import pool from "../database";

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Не авторизовано" });

  try {
    const userRes = await pool.query(
      "SELECT id, email, name, phone, address, role FROM users WHERE id = $1",
      [userId]
    );
    if (!userRes.rows[0]) return res.status(404).json({ message: "Користувача не знайдено" });
    res.status(200).json({ user: userRes.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
  const { name, phone, address } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Не авторизовано" });

  try {
    await pool.query(
      `UPDATE users SET name = $1, phone = $2, address = $3 WHERE id = $4`,
      [name, phone, address, userId]
    );
    res.json({ message: "Дані профілю оновлено" });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};
