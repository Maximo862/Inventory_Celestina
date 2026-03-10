import { pool } from "../db/db";
import { UserDB } from "../types/types";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function findUserByEmail(email: string): Promise<UserDB | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, email, password, role FROM users WHERE email = ?",
    [email]
  );

  return (rows as UserDB[])[0] || null;
}

export async function findUserById(id: number): Promise<UserDB | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, email, role FROM users WHERE id = ?",
    [id]
  );

  return (rows as UserDB[])[0] || null;
}

export interface CreateUserProps {
  email: string;
  password: string;
  role?: 'admin' | 'employee';
}

export async function createUser({
  email,
  password,
  role = 'employee'
}: CreateUserProps): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
    [email, password, role]
  );

  return result.insertId;
}