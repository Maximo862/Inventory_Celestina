import { loginUser, registerUser, verifyUser } from "../services/auth.Service";
import { Request, Response, NextFunction } from "express";

export async function registerAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, role } = req.body;

    const userData = await registerUser({
      email,
      password,
      role
    });

    res
      .cookie("token", userData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
      .json({
        message: "User Created",
        user: {
          id: userData.id,
          email,
          role: userData.role
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

    res
      .cookie("token", userData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
      .json({
        message: "Successful login",
        user: {
          id: userData.id,
          email,
          role: userData.role
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
      sameSite: "strict",
    });
    res.json({ message: "Logout successful" });
  } catch (err) {
    next(err);
  }
}