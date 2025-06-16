import express from "express";
import { test, register, login, forgotPassword, resetPassword } from "./controllers/auth";
import { authenticateToken, authenticateTokenOptional } from "./middleware/authMiddleware";
import {
  createProduct,
  getProducts,
  updateProduct,  
  deleteProduct,
  getProductById // додати
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
import { addOrUpdateReview, getReviews } from "./controllers/reviews";
import { getArchivedProductById, getAllArchivedProducts } from "./controllers/archivedProducts";
import { getFavorites, addFavorite, removeFavorite } from "./controllers/favorites";

const router = express.Router();



router.get("/test", test);
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", authenticateTokenOptional, resetPassword); 

router.get("/profile", authenticateToken, getProfile);
router.patch("/profile", authenticateToken, updateProfile); 

router.get("/my-orders", authenticateToken, getMyOrders); 

// Товари
router.post("/products", authenticateToken, createProduct);  
router.get("/products", getProducts);     
router.patch("/products/:id", authenticateToken, updateProduct); 
router.delete("/products/:id", authenticateToken, deleteProduct);
router.get("/products/:id", getProductById); 


router.get("/archived-products", getAllArchivedProducts);
router.get("/archived-products/:id", getArchivedProductById);

// Категорії
router.post("/categories", authenticateToken, createCategory);  
router.get("/categories", getCategories);  
router.patch("/categories/:id", authenticateToken, updateCategory); 
router.delete("/categories/:id", authenticateToken, deleteCategory); 

// Замовлення
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

router.get("/products/:productId/reviews", getReviews);
router.post("/products/:productId/reviews", authenticateToken, addOrUpdateReview);

router.get("/favorites", authenticateToken, getFavorites);
router.post("/favorites", authenticateToken, addFavorite);
router.delete("/favorites", authenticateToken, removeFavorite);

export default router;
