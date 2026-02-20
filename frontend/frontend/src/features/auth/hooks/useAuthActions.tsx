import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginRequest, logoutRequest, registerRequest } from "../api/authRequest";
import toast from "react-hot-toast";
import { handleError } from "@/utils/errorHandler";
import type { User } from "@/types/types";


export function useAuthActions() {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState<string | null>(null)

  if (!context) {
    throw new Error("useAuthActions must be used within AuthProvider");
  }

  const { setUser, setIsAuthenticated } = context;

  async function login(userData: User) {
    try {
      const res = await loginRequest(userData);
      setUser(res.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setUser(null);
      setIsAuthenticated(false);
      setErrors(error.message)
      handleError(error, "iniciar sesión");
      throw error;
    }
  }

  async function register(userData: User) {
    try {
      const res = await registerRequest(userData);
      setUser(res.user);
      setIsAuthenticated(true);
      toast.success("Registro exitoso");
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      handleError(error, "registrar");
      throw error;
    }
  }

  async function logout() {
    try {
      await logoutRequest();
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Sesión cerrada");
    } catch (error) {
      handleError(error, "cerrar sesión");
    }
  }
  

  return { login, register, logout, errors};
}
