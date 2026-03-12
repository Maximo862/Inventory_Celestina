import { fetchAPI } from "@/utils/fetchHelper";
import type {
  Order,
  OrderWithDetails,
  CreateOrderDTO,
  UpdateOrderDTO,
  PaginatedResponse,
  PaginationParams,
} from "@/types/types";

// Obtener todas las órdenes con filtro opcional
export const getAllOrdersRequest = (
  params?: PaginationParams & { type?: 'entry' | 'exit'; search?: string }
) => {
  const queryParams = new URLSearchParams();

  queryParams.append("page", (params?.page || 1).toString());
  queryParams.append("limit", (params?.limit || 10).toString());

  if (params?.type) {
    queryParams.append("type", params.type);
  }

  if (params?.search) {
    queryParams.append("search", params.search);
  }

  return fetchAPI<PaginatedResponse<Order>>(
    `/orders?${queryParams.toString()}`
  );
};

// Obtener orden por ID con detalles
export const getOrderByIdRequest = (id: number) =>
  fetchAPI<OrderWithDetails>(`/orders/${id}`);

// Crear orden (entrada o salida)
export const createOrderRequest = (data: CreateOrderDTO) =>
  fetchAPI<OrderWithDetails>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Actualizar orden (solo client_id y notes)
export const updateOrderRequest = (id: number, data: UpdateOrderDTO) =>
  fetchAPI<OrderWithDetails>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Eliminar orden
export const deleteOrderRequest = (id: number) =>
  fetchAPI<void>(`/orders/${id}`, {
    method: "DELETE",
  });

// Obtener estadísticas
export const getOrderStatsRequest = () =>
  fetchAPI<any>("/orders/stats");