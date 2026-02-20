import type { User } from "@/types/types";
import { createContext, useEffect, useState } from "react";
import { verifyRequest } from "../api/authRequest";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  errors: any;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(true);

  async function verify() {
    try {
      const res = await verifyRequest();
      setUser(res.user);
      setIsAuthenticated(true);
    } catch(err:any) {
      setUser(null);
      setIsAuthenticated(false);
      setErrors(err.error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    verify();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        setLoading,
        setUser,
        setIsAuthenticated,
        errors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
