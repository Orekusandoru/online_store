import { Request, Response } from "express";
import pool from "../database";

export const createOrder = async (req: Request, res: Response): Promise<any>  => {
  const client = await pool.connect();
  try {
    const { items, name, email, phone, address, user_id, paymentType } = req.body;
    let real_user_id = null;

  
    console.log("req.user:", req.user);
    console.log("user_id from body:", user_id);

    if (req.user && req.user.id) {
      real_user_id = req.user.id;
    } else if (user_id) {
      real_user_id = user_id;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Список товарів порожній або неправильний" });
    }

    
    if (!real_user_id && (!name || !email || !phone || !address)) {
      return res.status(400).json({ message: "Необхідно вказати ім'я, email, телефон та адресу" });
    }

    const total_price = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    await client.query("BEGIN");

  
    console.log("Inserting order with user_id:", real_user_id);

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_price, name, email, phone, address, payment_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [real_user_id, total_price, name || null, email || null, phone || null, address || null, paymentType || null]
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

export const updateOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, address, phone, email, name, items } = req.body;

    const fields = [];
    const values: any[] = [];
    let idx = 1;

    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (address !== undefined) {
      fields.push(`address = $${idx++}`);
      values.push(address);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(phone);
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }

    let newTotalPrice: number | undefined = undefined;
    if (Array.isArray(items)) {
      newTotalPrice = items.reduce(
        (sum: number, item: any) => sum + Number(item.quantity) * Number(item.price),
        0
      );
      fields.push(`total_price = $${idx++}`);
      values.push(newTotalPrice);
    }

    let query = "";
    if (fields.length > 0) {
      query = `UPDATE orders SET ${fields.join(", ")} WHERE id = $${idx}`;
      values.push(id);
      await pool.query(query, values);
    }

    if (Array.isArray(items)) {
      await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [id]);
      for (const item of items) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
          [id, item.product_id, item.quantity, item.price]
        );
      }
    }

    res.json({ message: "Замовлення оновлено" });
  } catch (err) {
    console.error("Помилка оновлення замовлення:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const orderRes = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [id]
    );
    const itemsRes = await pool.query(
      `SELECT oi.*, p.name as product_name, p.image_url, c.name as category_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE oi.order_id = $1`,
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

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ заборонено" });
  }
  try {
   
    const ordersRes = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    const orders = ordersRes.rows;


    const itemsRes = await pool.query("SELECT * FROM order_items");
    const items = itemsRes.rows;

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

export const getMyOrders = async (req: Request, res: Response): Promise<any> => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Не авторизовано" });
  }
  try {
    const ordersRes = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    const orders = ordersRes.rows;
    const itemsRes = await pool.query("SELECT * FROM order_items WHERE order_id = ANY($1::int[])", [
      orders.map((o: any) => o.id),
    ]);
    const items = itemsRes.rows;
    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      items: items.filter((item: any) => item.order_id === order.id),
    }));
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const getAllOrdersWithDetails = async (req: Request, res: Response): Promise<any> => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Доступ заборонено" });
  }
  try {
    const ordersRes = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    const orders = ordersRes.rows;

    const itemsRes = await pool.query(`
      SELECT 
        oi.*, 
        p.name as product_name, 
        p.image_url as image_url,   
        c.name as category_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
    `);
    const items = itemsRes.rows;

  
    const groupItems = (orderItems: any[]) => {
      const map = new Map<number, any>();
      for (const item of orderItems) {
        if (map.has(item.product_id)) {
          const existing = map.get(item.product_id);
          existing.quantity += item.quantity;
        } else {
          map.set(item.product_id, { ...item });
        }
      }
      return Array.from(map.values());
    };

    const ordersWithItems = orders.map(order => ({
      ...order,
      name: order.name,
      email: order.email,
      items: groupItems(items.filter(item => item.order_id === order.id))
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error("Помилка отримання всіх замовлень (детально):", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};
