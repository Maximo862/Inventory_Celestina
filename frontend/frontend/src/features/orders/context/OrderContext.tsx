import { createContext, useContext, useEffect, useState } from "react";
import { getAllOrdersRequest } from "../api/OrderRequests";
import type { Order } from "@/types/types";
import { useAuth } from "@/features/auth/context/AuthContext";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
}

export const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      loadOrders();
    }
  }, [authLoading, user]);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await getAllOrdersRequest();
      setOrders(res.data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshOrders() {
    await loadOrders();
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }

  return context;
}
