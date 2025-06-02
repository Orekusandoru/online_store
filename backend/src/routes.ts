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
  updateOrder,
  getAllOrders,
  getMyOrders,
  getAllOrdersWithDetails 
} from "./controllers/orders";
import { updateProfile, getProfile } from "./controllers/profile";
import { liqpayInitiate } from "./controllers/liqpay"; 
import { liqpayCallback } from "./controllers/liqpay"; 
import { requireAdminOrSeller } from "./middleware/roleMiddleware";
import { uploadImage } from "./controllers/upload";
import { getCart, saveCart } from "./controllers/cart";
import { getAnalytics } from "./controllers/analytics";

const router = express.Router();



router.get("/test", test);
router.post("/auth/register", register);
router.post("/auth/login", login);

router.get("/profile", authenticateToken, getProfile);
router.patch("/profile", authenticateToken, updateProfile); 

router.get("/my-orders", authenticateToken, getMyOrders); 

// Товари
router.post("/products", authenticateToken, createProduct);  
router.get("/products", getProducts);     
router.patch("/products/:id", authenticateToken, updateProduct); 
router.delete("/products/:id", authenticateToken, deleteProduct);

// Категорії
router.post("/categories", authenticateToken, createCategory);  
router.get("/categories", authenticateToken, getCategories);  
router.patch("/categories/:id", authenticateToken, updateCategory); 
router.delete("/categories/:id", authenticateToken, deleteCategory); 

router.get("/orders", authenticateToken, getAllOrders); 
router.get("/orders-details", authenticateToken, getAllOrdersWithDetails);
router.post("/orders", createOrder); 
router.get("/orders/:id", authenticateToken, getOrderById);
router.put("/orders/:id", authenticateToken, updateOrder);
router.delete("/orders/:id", authenticateToken, deleteOrder);

router.post("/liqpay-initiate", liqpayInitiate);
router.post("/liqpay-callback", liqpayCallback); 

router.post(
  "/upload",
  authenticateToken,
  requireAdminOrSeller,
  uploadImage 
);

router.get("/cart", authenticateToken, getCart);
router.post("/cart", authenticateToken, saveCart);

router.get("/analytics", authenticateToken, requireAdminOrSeller, getAnalytics);

export default router;
