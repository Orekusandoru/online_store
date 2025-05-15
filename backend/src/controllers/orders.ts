import { Request, Response } from "express";
import pool from "../database";

export const createOrder = async (req: Request, res: Response): Promise<any>  => {
  const client = await pool.connect();
  try {
    const { items, name, email, phone, address } = req.body;
    let user_id = null;

    // Якщо користувач авторизований
    if (req.user && req.user.id) {
      user_id = req.user.id;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Список товарів порожній або неправильний" });
    }

    
    if (!user_id && (!name || !email || !phone || !address)) {
      return res.status(400).json({ message: "Необхідно вказати ім'я, email, телефон та адресу" });
    }

    const total_price = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    await client.query("BEGIN");

    // Додаємо додаткові поля для гостя
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_price, name, email, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [user_id, total_price, name || null, email || null, phone || null, address || null]
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

export const getAllOrders = async (req: Request, res: Response): Promise<any> => {
  // Only admin can view all orders
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ заборонено" });
  }
  try {
    // Get all orders
    const ordersRes = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    const orders = ordersRes.rows;

    // Get all order items
    const itemsRes = await pool.query("SELECT * FROM order_items");
    const items = itemsRes.rows;

    // Attach items to orders
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id)
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error("Помилка отримання всіх замовлень:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};
