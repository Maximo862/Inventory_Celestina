import { useContext } from "react";
import { OrderContext } from "../context/OrderContext";
import {
  createOrderRequest,
  updateOrderRequest,
  deleteOrderRequest,
  getOrderByIdRequest,
} from "../api/OrderRequests";
import type { CreateOrderDTO, UpdateOrderDTO, OrderWithDetails } from "@/types/types";
import toast from "react-hot-toast";
import { handleError } from "@/utils/errorHandler";

export function useOrderActions() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrderActions must be used within OrderProvider");
  }

  const { refreshOrders } = context;

  async function getOrderById(id: number): Promise<OrderWithDetails> {
    try {
      const order = await getOrderByIdRequest(id);
      return order;
    } catch (error) {
      handleError(error, "obtener");
      throw error;
    }
  }

  async function createOrder(order: CreateOrderDTO) {
    try {
      await createOrderRequest(order);
      await refreshOrders();
      
      const message = order.type === 'entry' 
        ? "Entrada registrada exitosamente" 
        : "Salida registrada exitosamente";
      
      toast.success(message);
    } catch (error) {
      handleError(error, "crear");
      throw error;
    }
  }

  async function updateOrder(id: number, order: UpdateOrderDTO) {
    try {
      await updateOrderRequest(id, order);
      await refreshOrders();
      toast.success("Orden actualizada exitosamente");
    } catch (error) {
      handleError(error, "actualizar");
      throw error;
    }
  }

  async function deleteOrder(id: number) {
    try {
      await deleteOrderRequest(id);
      await refreshOrders();
      toast.success("Orden eliminada exitosamente");
    } catch (error) {
      handleError(error, "eliminar");
      throw error;
    }
  }

  return {
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
  };
}