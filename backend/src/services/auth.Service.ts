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
}

export async function registerUser({
  email,
  password,
}: RegisterProps) {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("User already exists");
  const hashed = await hashPassword(password);
  const userId = await createUser({
    email,
    password: hashed,
  });

  const token = generateToken({ id: userId });

  return { id: userId, email, token };
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
  token: string;
}> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const valid = await comparePassword(password, user.password!);
  if (!valid) throw new Error("Incorrect password");

  const token = generateToken({ id: user.id });

  return {
    id: user.id,
    email,
    token
  };
}

export async function verifyUser(token: string): Promise<UserDB> {
  const decoded: DecodedToken = verifyToken(token);
  const user = await findUserById(decoded.id);

  if (!user) throw new Error("User not found");

  return user;
}
