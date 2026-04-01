import { loginUser, registerUser, verifyUser } from "../services/auth.Service";
import { Request, Response, NextFunction } from "express";
import { findUserById } from "../repositories/auth.Repository";

export async function registerAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, role, branch_id } = req.body;

    const userData = await registerUser({
      email,
      password,
      role,
      branch_id
    });

    res
      .cookie("token", userData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
      .json({
        message: "User Created",
        user: {
          id: userData.id,
          email,
          role: userData.role,
          branch_id: userData.branch_id
        },
      });
  } catch (err) {
    next(err);
  }
}

export async function loginAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const userData = await loginUser({ email, password });

    // Obtener branch_id del usuario
    const user = await findUserById(userData.id);

    res
      .cookie("token", userData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
      .json({
        message: "Successful login",
        user: {
          id: userData.id,
          email,
          role: userData.role,
          branch_id: user?.branch_id || null
        },
      });
  } catch (err) {
    next(err);
  }
}

export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token" });

    const user = await verifyUser(token);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function logoutAuth(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    res.json({ message: "Logout successful" });
  } catch (err) {
    next(err);
  }
}