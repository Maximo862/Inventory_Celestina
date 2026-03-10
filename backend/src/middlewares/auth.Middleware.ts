import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  role: 'admin' | 'employee';  
}


export function authRequired(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Ahora decoded incluye { id, role }
    req.user = {
      id: decoded.id,
      role: decoded.role  // ← AGREGAR
    };

    next();
  } catch (error: any) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}