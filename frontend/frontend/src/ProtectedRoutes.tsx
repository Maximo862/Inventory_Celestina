import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./features/auth/context/AuthContext";

export function ProtectedRoutes() {
  const { isAuthenticated, loading } = useContext(AuthContext)!;

  if (loading === true) return <p>loading...</p>;
  if (isAuthenticated === false) return <Navigate to={"/login"} replace />;

  return <Outlet />;
}
