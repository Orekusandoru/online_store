import { Request, Response, NextFunction } from "express";

export const requireAdminOrSeller = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "seller")) {
    next();
  } else {
    res.status(403).json({ message: "Доступ заборонено" });
  }
};
