import express from "express";
import { register, login } from "./auth";
import { authenticateToken } from "./middleware/authMiddleware";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);

// route з токеном
router.get("/profile", authenticateToken, (req, res) => {
    // req.user  (id, email)
    res.status(200).json({ message: "Це захищений маршрут", user: req.user });
  });

export default router;
