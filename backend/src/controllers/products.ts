import { Request, Response } from "express";
import pool from "../database";

export const createProduct = async (req: Request, res: Response): Promise<any> => {
  const {
    name,
    description,
    price,
    category_id,
    image_url,
    screen_size,
    resolution,
    ram,
    storage,
    processor,
    battery,
    refresh_rate,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products (
        name, description, price, category_id, image_url, created_at, updated_at,
        screen_size, resolution, ram, storage, processor, battery, refresh_rate
      )
      VALUES (
        $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *`,
      [
        name,
        description,
        price,
        category_id,
        image_url,
        screen_size ?? null,
        resolution ?? null,
        ram ?? null,
        storage ?? null,
        processor ?? null,
        battery ?? null,
        refresh_rate ?? null,
      ]
    );

    const newProduct = result.rows[0];
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<any> => {
  const { category, minPrice, maxPrice, sort, page, limit,
    processor, ram, storage, screen_size, resolution, battery, refresh_rate
  } = req.query;

  let query = `SELECT * FROM products WHERE 1=1`;
  const values: any[] = [];
  let queryIndex = 1;

  if (category) {
    query += ` AND category_id = $${queryIndex}`;
    values.push(category);
    queryIndex++;
  }
  if (minPrice) {
    query += ` AND price >= $${queryIndex}`;
    values.push(minPrice);
    queryIndex++;
  }
  if (maxPrice) {
    query += ` AND price <= $${queryIndex}`;
    values.push(maxPrice);
    queryIndex++;
  }


  if (processor) {
    query += ` AND processor = $${queryIndex}`;
    values.push(processor);
    queryIndex++;
  }
  if (ram) {
    query += ` AND ram = $${queryIndex}`;
    values.push(ram);
    queryIndex++;
  }
  if (storage) {
    query += ` AND storage = $${queryIndex}`;
    values.push(storage);
    queryIndex++;
  }
  if (screen_size) {
    query += ` AND screen_size = $${queryIndex}`;
    values.push(screen_size);
    queryIndex++;
  }
  if (resolution) {
    query += ` AND resolution = $${queryIndex}`;
    values.push(resolution);
    queryIndex++;
  }
  if (battery) {
    query += ` AND battery = $${queryIndex}`;
    values.push(battery);
    queryIndex++;
  }
  if (refresh_rate) {
    query += ` AND refresh_rate = $${queryIndex}`;
    values.push(refresh_rate);
    queryIndex++;
  }


  if (sort === "price_asc") {
    query += ` ORDER BY price ASC`;
  } else if (sort === "price_desc") {
    query += ` ORDER BY price DESC`;
  } else if (sort === "rating_desc") {
    query += ` ORDER BY rating DESC NULLS LAST`;
  } else if (sort === "rating_asc") {
    query += ` ORDER BY rating ASC NULLS LAST`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }

  // Пагінація
  let pageNum = Number(page) || 1;
  let limitNum = Number(limit) || 20;
  let offset = (pageNum - 1) * limitNum;
  query += ` LIMIT $${queryIndex}`;
  values.push(limitNum);
  queryIndex++;
  query += ` OFFSET $${queryIndex}`;
  values.push(offset);

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    category_id,
    image_url,
    screen_size,
    resolution,
    ram,
    storage,
    processor,
    battery,
    refresh_rate,
  } = req.body;

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
  if (screen_size !== undefined) {
    fields.push(`screen_size = $${fields.length + 1}`);
    values.push(screen_size);
  }
  if (resolution !== undefined) {
    fields.push(`resolution = $${fields.length + 1}`);
    values.push(resolution);
  }
  if (ram !== undefined) {
    fields.push(`ram = $${fields.length + 1}`);
    values.push(ram);
  }
  if (storage !== undefined) {
    fields.push(`storage = $${fields.length + 1}`);
    values.push(storage);
  }
  if (processor !== undefined) {
    fields.push(`processor = $${fields.length + 1}`);
    values.push(processor);
  }
  if (battery !== undefined) {
    fields.push(`battery = $${fields.length + 1}`);
    values.push(battery);
  }
  if (refresh_rate !== undefined) {
    fields.push(`refresh_rate = $${fields.length + 1}`);
    values.push(refresh_rate);
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
  
    const selectRes = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
    if (selectRes.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    const product = selectRes.rows[0];

    await pool.query(
      `INSERT INTO archived_products (
        id, name, description, price, category_id, image_url, created_at, updated_at,
        rating, rating_count, popularity, screen_size, resolution, ram, storage, processor, battery, refresh_rate
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
      )`,
      [
        product.id, product.name, product.description, product.price, product.category_id, product.image_url,
        product.created_at, product.updated_at, product.rating, product.rating_count, product.popularity,
        product.screen_size, product.resolution, product.ram, product.storage, product.processor, product.battery, product.refresh_rate
      ]
    );

    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);

    res.json({ message: "Product archived and deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
