import { Request, Response } from "express";
import pool from "../database";


export const getArchivedProductById = async (req: Request, res: Response): Promise<any>  => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM archived_products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Archived product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllArchivedProducts = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM archived_products ORDER BY archived_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
