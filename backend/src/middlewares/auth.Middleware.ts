import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  role: 'admin' | 'employee';
  branch_id: number;
}


export function authRequired(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Ahora decoded incluye { id, role, branch_id }
    req.user = {
      id: decoded.id,
      role: decoded.role,
      branch_id: decoded.branch_id
    };

    next();
  } catch (error: any) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}