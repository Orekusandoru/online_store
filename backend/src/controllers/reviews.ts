import { Request, Response } from "express";
import pool from "../database";


export const addOrUpdateReview = async (req: Request, res: Response) : Promise<any>=> {
  const userId = req.user?.id;
  const { productId } = req.params;
  const { rating, comment } = req.body;
  if (!userId) return res.status(401).json({ message: "Не авторизовано" });
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Некоректна оцінка" });

  try {
    await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, user_id) DO UPDATE SET rating = $3, comment = $4`,
      [productId, userId, rating, comment]
    );

    const stats = await pool.query(
      `SELECT AVG(rating)::numeric(3,2) as avg, COUNT(*) as cnt FROM reviews WHERE product_id = $1`,
      [productId]
    );
    await pool.query(
      `UPDATE products SET rating = $1, rating_count = $2 WHERE id = $3`,
      [stats.rows[0].avg, stats.rows[0].cnt, productId]
    );

    res.json({ message: "Відгук збережено" });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};
