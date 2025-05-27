import { Request, Response } from "express";
import crypto from "crypto";
import pool from "../database";
// @ts-ignore
import LiqPay from "liqpay";
import fetch from "node-fetch"; 

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY || "";
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY || "";

export const liqpayInitiate = async (req: Request, res: Response): Promise<void> => {
  const { orderId, amount, description } = req.body;
  if (!orderId || !amount) {
    res.status(400).json({ message: "orderId та amount обов'язкові" });
    return;
  }

  const liqpay_order_id = `${orderId}_${Date.now()}`;

 
  await pool.query(
    `INSERT INTO liqpay_orders (order_id, liqpay_order_id) VALUES ($1, $2)
     ON CONFLICT (order_id) DO UPDATE SET liqpay_order_id = EXCLUDED.liqpay_order_id`,
    [orderId, liqpay_order_id]
  );

  const params = {
    public_key: LIQPAY_PUBLIC_KEY,
    version: "3",
    action: "pay",
    amount: amount.toString(),
    currency: "UAH",
    description: description || `Оплата замовлення №${orderId}`,
    order_id: liqpay_order_id,
  };

  const json_string = JSON.stringify(params);
  const data = Buffer.from(json_string).toString("base64");
  const signature = crypto
    .createHash("sha1")
    .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
    .digest("base64");

  res.json({ liqpayData: data, signature });
};

export const liqpayCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.orderId) {
      const { orderId } = req.body;
      console.log("Запит статусу LiqPay для orderId:", orderId);

      const result = await pool.query(
        "SELECT liqpay_order_id FROM liqpay_orders WHERE order_id = $1",
        [orderId]
      );
      if (!result.rows[0]) {
        console.error("liqpay_order_id не знайдено для order_id:", orderId);
        res.status(404).json({ status: "not_found" });
        return;
      }
      const liqpay_order_id = result.rows[0].liqpay_order_id;
      console.log("Використовується liqpay_order_id:", liqpay_order_id);

  
      const params = {
        public_key: LIQPAY_PUBLIC_KEY,
        version: "3",
        action: "status",
        order_id: liqpay_order_id,
      };
      const json_string = JSON.stringify(params);
      const data = Buffer.from(json_string).toString("base64");
      const signature = crypto
        .createHash("sha1")
        .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
        .digest("base64");

    
      const response = await fetch("https://www.liqpay.ua/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data, signature }),
      });

      const liqpayJson = await response.json();
      console.log("Відповідь LiqPay:", liqpayJson);
      res.json({ status: liqpayJson.status || "unknown", liqpay: liqpayJson });
      return;
    }

    const { data, signature } = req.body;
    if (!data || !signature) {
      res.status(400).json({ message: "Missing data or signature" });
      return;
    }

    const expectedSignature = crypto
      .createHash("sha1")
      .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
      .digest("base64");
    if (signature !== expectedSignature) {
      res.status(403).json({ message: "Invalid signature" });
      return;
    }

    const json = Buffer.from(data, "base64").toString("utf-8");
    const payment = JSON.parse(json);

 
    if (payment.status === "success" && payment.order_id) {
      const result = await pool.query(
        "SELECT order_id FROM liqpay_orders WHERE liqpay_order_id = $1",
        [payment.order_id]
      );
      if (result.rows[0]) {
        await pool.query(
          "UPDATE orders SET status = $1 WHERE id = $2",
          ["paid", result.rows[0].order_id]
        );
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("LiqPay callback error:", err);
    res.sendStatus(500);
  }
};
