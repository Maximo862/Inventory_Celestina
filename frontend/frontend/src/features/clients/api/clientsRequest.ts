import { fetchAPI } from "@/utils/fetchHelper";
import type {
    Client,
    CreateClientDTO,
    UpdateClientDTO,
    PaginatedResponse,
    PaginationParams,
} from "@/types/types";

export const getAllClientsRequest = (
    params?: PaginationParams & {
        search?: string;
        sortField?: string;
        sortOrder?: 'ASC' | 'DESC';
    }
) => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params?.page || 1).toString());
    queryParams.append("limit", (params?.limit || 10).toString());

    if (params?.search) {
        queryParams.append("search", params.search);
    }

    if (params?.sortField) {
        queryParams.append("sortField", params.sortField);
    }

    if (params?.sortOrder) {
        queryParams.append("sortOrder", params.sortOrder);
    }

    return fetchAPI<PaginatedResponse<Client>>(
        `/clients?${queryParams.toString()}`
    );
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

export const searchClientsRequest = (query: string, limit: number = 10) =>
    fetchAPI<{ id: number; name: string }[]>(`/clients/search?query=${encodeURIComponent(query)}&limit=${limit}`);