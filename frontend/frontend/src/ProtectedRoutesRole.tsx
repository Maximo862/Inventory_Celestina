import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./features/auth/context/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner"; 

export function ProtectedRoutesRole() {
  const context = useContext(AuthContext);

  if (!context) {
    return <Navigate to="/login" replace />;
  }

  const { isAuthenticated, loading, user } = context;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/orders" replace />;
  }

  return <Outlet />;
}
