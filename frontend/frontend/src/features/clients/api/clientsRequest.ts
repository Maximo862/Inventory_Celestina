import { fetchAPI } from "@/utils/fetchHelper";
import type {
    Client,
    CreateClientDTO,
    UpdateClientDTO,
    PaginatedResponse,
    PaginationParams,
} from "@/types/types";

export const getAllClientsRequest = (params?: PaginationParams) => {
    const queryString = params
        ? `?page=${params.page || 1}&limit=${params.limit || 10}`
        : "";

    return fetchAPI<PaginatedResponse<Client>>(`/clients${queryString}`);
};

export const getClientByIdRequest = (id: number) =>
    fetchAPI<Client>(`/clients/${id}`);

export const createClientRequest = (data: CreateClientDTO) =>
    fetchAPI<Client>("/clients", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateClientRequest = (id: number, data: UpdateClientDTO) =>
    fetchAPI<Client>(`/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const deleteClientRequest = (id: number) =>
    fetchAPI<void>(`/clients/${id}`, {
        method: "DELETE",
    });