import jwt from "jsonwebtoken";
import { DecodedToken } from "../types/types";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

export function generateToken(payload: DecodedToken): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "1h" });
}

export function verifyToken<T>(token: string): T {
  return jwt.verify(token, getSecret()) as T;
}
