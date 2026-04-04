import { createContext, useContext, useEffect, useState } from "react";
import { getAllOrdersRequest } from "../api/OrderRequests";
import type { Order, PaginationParams } from "@/types/types";
import { useAuth } from "@/features/auth/context/AuthContext";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  pagination: PaginationInfo | null;
  loadOrders: (
    params: PaginationParams & { type?: 'entry' | 'exit'; search?: string; branch_id?: number }
  ) => Promise<void>;
  refreshOrders: (
    params: PaginationParams & { type?: 'entry' | 'exit'; search?: string; branch_id?: number }
  ) => Promise<void>;
}

export const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      loadOrders({ page: 1, limit: 10 });
    }
  }, [authLoading, user]);

  async function loadOrders(
    params: PaginationParams & { type?: 'entry' | 'exit'; search?: string; branch_id?: number }
  ) {
    try {
      setLoading(true);
      const res = await getAllOrdersRequest(params);
      setOrders(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshOrders(
    params: PaginationParams & { type?: 'entry' | 'exit'; search?: string; branch_id?: number }
  ) {
    await loadOrders(params);
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        pagination,
        loadOrders,
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