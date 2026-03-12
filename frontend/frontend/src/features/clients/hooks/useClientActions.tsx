import { useClients } from "../context/ClientContext";
import {
  createClientRequest,
  updateClientRequest,
  deleteClientRequest,
  getClientByIdRequest,
} from "../api/clientsRequest";
import type { CreateClientDTO, UpdateClientDTO, Client } from "@/types/types";
import toast from "react-hot-toast";
import { handleError } from "@/utils/errorHandler";

export function useClientActions() {
  const { refreshClients, pagination } = useClients();

  async function getClientById(id: number): Promise<Client> {
    try {
      const client = await getClientByIdRequest(id);
      return client;
    } catch (error) {
      handleError(error, "obtener");
      throw error;
    }
  }

  async function createClient(client: CreateClientDTO) {
    try {
      await createClientRequest(client);
      await refreshClients({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      });
      toast.success("Cliente creado exitosamente");
    } catch (error) {
      handleError(error, "crear");
      throw error;
    }
  }

  async function updateClient(id: number, client: UpdateClientDTO) {
    try {
      await updateClientRequest(id, client);
      await refreshClients({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      });
      toast.success("Cliente actualizado exitosamente");
    } catch (error) {
      handleError(error, "actualizar");
      throw error;
    }
  }

  async function deleteClient(id: number) {
    try {
      await deleteClientRequest(id);
      await refreshClients({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      });
      toast.success("Cliente eliminado exitosamente");
    } catch (error) {
      handleError(error, "eliminar");
      throw error;
    }
  }

  return {
    getClientById,
    createClient,
    updateClient,
    deleteClient,
  };
}