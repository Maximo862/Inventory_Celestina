import { createContext, useContext, useEffect, useState } from "react";
import { getAllClientsRequest } from "../api/clientsRequest";
import type { Client, PaginationParams } from "@/types/types";
import { useAuth } from "@/features/auth/context/AuthContext";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ClientContextType {
  clients: Client[];
  loading: boolean;
  pagination: PaginationInfo | null;
  loadClients: (
    params: PaginationParams & {
      search?: string;
      sortField?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ) => Promise<void>;
  refreshClients: (
    params: PaginationParams & {
      search?: string;
      sortField?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ) => Promise<void>;
}

export const ClientContext = createContext<ClientContextType | null>(null);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      loadClients({ page: 1, limit: 10 });
    }
  }, [authLoading, user]);

  async function loadClients(
    params: PaginationParams & {
      search?: string;
      sortField?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ) {
    try {
      setLoading(true);
      const res = await getAllClientsRequest(params);
      setClients(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshClients(
    params: PaginationParams & {
      search?: string;
      sortField?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ) {
    await loadClients(params);
  }

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
        pagination,
        loadClients,
        refreshClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);

  if (!context) {
    throw new Error("useClients must be used within ClientsProvider");
  }

  return context;
}