import { Request, Response } from "express";
import pool from "../database";

export const getAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const { startDate, endDate, category, status } = req.query;

    // Динамічні фільтри для SQL
    let filters = [`orders.created_at BETWEEN $1 AND $2`];
    let params: any[] = [startDate, endDate];
    let paramIdx = 3;

    if (category) {
      filters.push(`orders.id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category_id = $${paramIdx}))`);
      params.push(category);
      paramIdx++;
    }
    if (status) {
      filters.push(`orders.status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }
    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // Total Orders
    const totalOrdersRes = await pool.query(
      `SELECT COUNT(*) AS total_orders FROM orders ${whereClause}`,
      params
    );
    const totalOrders = Number(totalOrdersRes.rows[0].total_orders);

    // Total Revenue
    const totalRevenueRes = await pool.query(
      `SELECT SUM(total_price) AS total_revenue FROM orders ${whereClause}`,
      params
    );
    const totalRevenue = Number(totalRevenueRes.rows[0].total_revenue) || 0;

    // Average Order Value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // New Customers
    const newCustomersRes = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS new_customers FROM orders ${whereClause} AND user_id IS NOT NULL`,
      params
    );
    const newCustomers = Number(newCustomersRes.rows[0].new_customers);

    // Order Distribution by Status
    const orderStatusRes = await pool.query(
      `SELECT status, COUNT(*) AS count FROM orders ${whereClause} GROUP BY status`,
      params
    );
    const orderDistribution = orderStatusRes.rows;

    // Revenue by Day (for charts)
    const revenueByDayRes = await pool.query(
      `SELECT DATE(created_at) AS day, SUM(total_price) AS revenue, COUNT(*) AS orders
       FROM orders ${whereClause}
       GROUP BY day ORDER BY day`,
      params
    );
    const revenueByDay = revenueByDayRes.rows;

    // Найпопулярніші товари (за кількістю покупок)
    const popularProductsRes = await pool.query(
      `SELECT oi.product_id, p.name, SUM(oi.quantity) AS total_sold
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       ${whereClause ? whereClause.replace(/orders\./g, "o.") : ""}
       GROUP BY oi.product_id, p.name
       ORDER BY total_sold DESC
       LIMIT 10`,
      params
    );
    const popularProducts = popularProductsRes.rows;

    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      newCustomers,
      orderDistribution,
      revenueByDay,
      popularProducts,
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
};
