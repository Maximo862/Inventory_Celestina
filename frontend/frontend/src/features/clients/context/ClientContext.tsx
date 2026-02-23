import { createContext, useContext, useEffect, useState } from "react";
import { getAllClientsRequest } from "../api/clientsRequest";
import type { Client } from "@/types/types";

interface ClientContextType {
  clients: Client[];
  loading: boolean;
  refreshClients: () => Promise<void>;
}

export const ClientContext = createContext<ClientContextType | null>(null);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setLoading(true);
      const res = await getAllClientsRequest();
      setClients(res.data);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshClients() {
    await loadClients();
  }

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
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