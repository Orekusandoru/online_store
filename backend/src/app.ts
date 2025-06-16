import express from "express";
import pool from "./database";
import rateLimit from "express-rate-limit";

import router from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 30,
  message: "Too many requests, please try again later.",
});


app.use((req, res, next) => {
  if (req.path.startsWith("/api/cart")) {
    return next();
  }
  return limiter(req, res, next);
});

app.use(router);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;