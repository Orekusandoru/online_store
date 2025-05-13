import express from "express";
import { test, register, login } from "./controllers/auth";
import { authenticateToken } from "./middleware/authMiddleware";
import {
  createProduct,
  getProducts,
  updateProduct,  
  deleteProduct
} from "./controllers/products";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from "./controllers/categories"; 
import { 
  createOrder, 
  deleteOrder, 
  getOrderById, 
  updateOrder 
} from "./controllers/orders";

const router = express.Router();

router.get("/test", test);
router.post("/auth/register", register);
router.post("/auth/login", login);

router.get("/profile", authenticateToken, (req, res) => {
    // req.user  (id, email)
    res.status(200).json({ message: "Це захищений маршрут", user: req.user });
  });

// Продукти
router.post("/products", authenticateToken, createProduct);  
router.get("/products", authenticateToken, getProducts);     
router.patch("/products/:id", authenticateToken, updateProduct); 
router.delete("/products/:id", authenticateToken, deleteProduct);

// Категорії
router.post("/categories", authenticateToken, createCategory);  
router.get("/categories", authenticateToken, getCategories);  
router.patch("/categories/:id", authenticateToken, updateCategory); 
router.delete("/categories/:id", authenticateToken, deleteCategory); 

router.post("/orders", authenticateToken, createOrder);
router.get("/orders/:id", authenticateToken, getOrderById);
router.put("/orders/:id", authenticateToken, updateOrder);
router.delete("/orders/:id", authenticateToken, deleteOrder);


export default router;
