// controllers/products.ts
import { Request, Response } from "express";
import pool from "../database";

export const createProduct = async (req: Request, res: Response): Promise<any> => {
  const { name, description, price, category_id, image_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, category_id, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [name, description, price, category_id, image_url]
    );

    const newProduct = result.rows[0];
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<any> => {
  const { category_id, min_price, max_price, limit, offset } = req.query;

  let query = `SELECT * FROM products WHERE 1=1`;
  const values: any[] = [];
  let queryIndex = 1;

  if (category_id) {
    query += ` AND category_id = $${queryIndex}`;
    values.push(category_id);
    queryIndex++;
  }

  if (min_price) {
    query += ` AND price >= $${queryIndex}`;
    values.push(min_price);
    queryIndex++;
  }

  if (max_price) {
    query += ` AND price <= $${queryIndex}`;
    values.push(max_price);
    queryIndex++;
  }

  if (limit) {
    query += ` LIMIT $${queryIndex}`;
    values.push(limit);
    queryIndex++;
  }

  if (offset) {
    query += ` OFFSET $${queryIndex}`;
    values.push(offset);
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, description, price, category_id, image_url } = req.body;
  
  const fields = [];
  const values = [];
  if (name !== undefined) {
    fields.push(`name = $${fields.length + 1}`);
    values.push(name);
  }
  if (description !== undefined) {
    fields.push(`description = $${fields.length + 1}`);
    values.push(description);
  }
  if (price !== undefined) {
    fields.push(`price = $${fields.length + 1}`);
    values.push(price);
  }
  if (category_id !== undefined) {
    fields.push(`category_id = $${fields.length + 1}`);
    values.push(category_id);
  }
  if (image_url !== undefined) {
    fields.push(`image_url = $${fields.length + 1}`);
    values.push(image_url);
  }
  
  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  const query = `
    UPDATE products 
    SET ${fields.join(", ")}
    WHERE id = $${values.length + 1} 
    RETURNING *`;
  
  values.push(id);
  
  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
