import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";


declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response,next: NextFunction): Promise<any> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ message: "Токен не надано" });
  }

  jwt.verify(token, JWT_SECRET as string, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Недійсний токен" });
    }
    req.user = user;
    next();
  });
};

export const authenticateTokenOptional = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    req.user = undefined;
    return next();
  }
  jwt.verify(token, JWT_SECRET as string, (err, user) => {
    if (err) {
      req.user = undefined;
      return next();
    }
    req.user = user;
    next();
  });
};
