import express from "express";
import { register, login } from "./controllers/auth";
import { authenticateToken } from "./middleware/authMiddleware";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from "./controllers/products";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);

router.get("/profile", authenticateToken, (req, res) => {
    // req.user  (id, email)
    res.status(200).json({ message: "Це захищений маршрут", user: req.user });
  });

router.post("/products", authenticateToken, createProduct);  
router.get("/products", authenticateToken, getProducts);     
router.patch("/products/:id", authenticateToken, updateProduct); 
router.delete("/products/:id", authenticateToken, deleteProduct); 

export default router;
