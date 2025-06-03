import { Request, Response } from "express";
import pool from "../database";

export const getCart = async (req: Request, res: Response) : Promise<any>=> {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Не авторизовано" });

  const result = await pool.query("SELECT items FROM carts WHERE user_id = $1", [userId]);
  if (result.rows.length === 0) {
    return res.json({ items: [] });
  }
  res.json({ items: result.rows[0].items });
};

export const saveCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  let { items } = req.body;
  if (!userId) return res.status(401).json({ message: "Не авторизовано" });

  console.log("saveCart items:", items, "type:", typeof items);

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "Некоректний формат кошика (items має бути масивом)" });
  }

  await pool.query(
    `INSERT INTO carts (user_id, items, updated_at)
     VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO UPDATE SET items = $2::jsonb, updated_at = CURRENT_TIMESTAMP`,
    [userId, JSON.stringify(items)]
  );
  res.json({ message: "Кошик збережено" });
};
