import { Request, Response } from "express";
import pool from "../database";

export const createOrder = async (req: Request, res: Response): Promise<any>  => {
  const client = await pool.connect();
  try {
    const user_id = req.user.id;
    const { items } = req.body;


    await client.query("BEGIN");

    const orderRes = await client.query(
      `INSERT INTO orders (user_id) VALUES ($1) RETURNING id`,
      [user_id]
    );

    const orderId = orderRes.rows[0].id;

    const insertItems = items.map((item: any) =>
      client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      )
    );

    await Promise.all(insertItems);
    await client.query("COMMIT");

    res.status(201).json({ message: "Замовлення створено", orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Помилка створення замовлення:", err);
    res.status(500).json({ message: "Помилка сервера" });
  } finally {
    client.release();
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<any>  => {
  try {
    const { id } = req.params;

    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [id]);
    const itemsRes = await pool.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: "Замовлення не знайдено" });
    }

    res.json({ ...orderRes.rows[0], items: itemsRes.rows });
  } catch (err) {
    console.error("Помилка отримання замовлення:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<any>  => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);

    res.json({ message: "Замовлення оновлено" });
  } catch (err) {
    console.error("Помилка оновлення замовлення:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<any>  => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [id]);
    await pool.query(`DELETE FROM orders WHERE id = $1`, [id]);

    res.json({ message: "Замовлення видалено" });
  } catch (err) {
    console.error("Помилка видалення замовлення:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};
