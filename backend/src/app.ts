import express from "express";
import pool from "./database";

import router from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(router);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;