import { Request, Response } from "express";
import pool from "../database";

export const getFavorites = async (req: Request, res: Response): Promise<any>  => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Не авторизовано" });
  const result = await pool.query(
    `SELECT f.product_id, p.* FROM favorites f
     JOIN products p ON f.product_id = p.id
     WHERE f.user_id = $1`,
    [userId]
  );
  res.json(result.rows);
};

export const addFavorite = async (req: Request, res: Response): Promise<any>  => {
  const userId = req.user?.id;
  const { productId } = req.body;
  if (!userId) return res.status(401).json({ message: "Не авторизовано" });
  if (!productId) return res.status(400).json({ message: "Не вказано товар" });
  await pool.query(
    `INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, productId]
  );
  res.json({ message: "Додано до обраного" });
};

export const removeFavorite = async (req: Request, res: Response): Promise<any>  => {
  const userId = req.user?.id;
  const productId = req.query.productId || req.body.productId;
  if (!userId) return res.status(401).json({ message: "Не авторизовано" });
  if (!productId) return res.status(400).json({ message: "Не вказано товар" });
  await pool.query(
    `DELETE FROM favorites WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  );
  res.json({ message: "Видалено з обраного" });
};
