import {
  findUserByEmail,
  findUserById,
  createUser,
} from "../repositories/auth.Repository";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken, verifyToken } from "../utils/jwt";
import { UserDB, DecodedToken } from "../types/types";

interface RegisterProps {
  email: string;
  password: string;
  role?: 'admin' | 'employee';
  branch_id?: number;
}

export async function registerUser({
  email,
  password,
  role,
  branch_id
}: RegisterProps) {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("User already exists");

  const hashed = await hashPassword(password);
  const userId = await createUser({
    email,
    password: hashed,
    role,
    branch_id
  });

  // Obtener usuario completo con role
  const user = await findUserById(userId);
  if (!user) throw new Error("Failed to create user");

  const token = generateToken({ id: userId, role: user.role, branch_id: user.branch_id! });

  return {
    id: userId,
    email,
    role: user.role,
    branch_id: user.branch_id,
    token
  };
}

interface LoginProps {
  email: string;
  password: string;
}

export async function loginUser({
  email,
  password,
}: LoginProps): Promise<{
  id: number;
  email: string;
  role: 'admin' | 'employee';
  branch_id?: number;
  token: string;
}> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const valid = await comparePassword(password, user.password!);
  if (!valid) throw new Error("Incorrect password");

  const token = generateToken({ id: user.id, role: user.role, branch_id: user.branch_id! });

  return {
    id: user.id,
    email,
    role: user.role,
    branch_id: user.branch_id,
    token
  };
}

export async function verifyUser(token: string): Promise<UserDB> {
  const decoded: DecodedToken = verifyToken(token);
  const user = await findUserById(decoded.id);

  if (!user) throw new Error("User not found");

  return user;
}