import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmpityState";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { OrderCard } from "../components/OrderCard";
import { OrderFormModal } from "../components/OrderFormModal";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { useOrders } from "../context/OrderContext";
import { useOrderActions } from "../hooks/useOrderActions";
import { FiPlus, FiFileText } from "react-icons/fi";
import type { Order, OrderWithDetails } from "@/types/types";

type FilterOption = "all" | "entry" | "exit";
type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export function OrdersPage() {
  const { orders, loading } = useOrders();
  const { createOrder, updateOrder, deleteOrder, getOrderById } =
    useOrderActions();

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    order: Order | null;
  }>({
    isOpen: false,
    order: null,
  });

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    order: OrderWithDetails | null;
  }>({
    isOpen: false,
    order: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    type: string;
  }>({
    isOpen: false,
    id: null,
    type: "",
  });

  const [filterType, setFilterType] = useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [isDeleting, setIsDeleting] = useState(false);

  // Crear mapa de nombres de clientes
  const clientMap = useMemo(() => {
    const map = new Map<number, string>();
    orders.forEach((order: any) => {
      if (order.client_name) {
        map.set(order.id, order.client_name);
      }
    });
    return map;
  }, [orders]);

  // Filtrado y ordenamiento
  const filteredAndSortedOrders = useMemo(() => {
    let result = orders.filter((order) => {
      if (filterType === "all") return true;
      return order.type === filterType;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date-asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "amount-desc":
          return b.total_amount - a.total_amount;
        case "amount-asc":
          return a.total_amount - b.total_amount;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, filterType, sortBy]);

  const handleCreate = () => {
    setFormModal({ isOpen: true, order: null });
  };

  const handleEdit = (order: Order) => {
    setFormModal({ isOpen: true, order });
  };

  const handleView = async (order: Order) => {
    try {
      const detailOrder = await getOrderById(order.id);
      setDetailModal({ isOpen: true, order: detailOrder });
    } catch (error) {
      console.error("Error loading order details:", error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (formModal.order) {
      await updateOrder(formModal.order.id, data);
    } else {
      await createOrder(data);
    }
  };

  const handleFormClose = () => {
    setFormModal({ isOpen: false, order: null });
  };

  const handleDetailClose = () => {
    setDetailModal({ isOpen: false, order: null });
  };

  const handleDeleteClick = (id: number, type: string) => {
    setDeleteModal({ isOpen: true, id, type });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      await deleteOrder(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, type: "" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, id: null, type: "" });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Remitos"
        subtitle="Registro de entradas y salidas"
        action={
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
            className="flex items-center justify-center gap-3"
          >
            <FiPlus className="text-2xl" />
            Nuevo remito
          </Button>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<FiFileText />}
          title="No hay remitos"
          description="Comience registrando su primer remito de entrada o salida"
          actionLabel="Crear primer remito"
          onAction={handleCreate}
        />
      ) : (
        <>
          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por tipo */}
              <div>
                <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                  Filtrar por tipo
                </label>
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as FilterOption)
                  }
                  className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
                >
                  <option value="all">📁 Todos los remitos</option>
                  <option value="entry">📥 Solo entradas</option>
                  <option value="exit">📤 Solo salidas</option>
                </select>
              </div>

              {/* Ordenar */}
              <div>
                <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
                >
                  <option value="date-desc">📅 Más reciente primero</option>
                  <option value="date-asc">📅 Más antiguo primero</option>
                  <option value="amount-desc">💰 Monto (mayor → menor)</option>
                  <option value="amount-asc">💰 Monto (menor → mayor)</option>
                </select>
              </div>
            </div>

            {/* Contador */}
            <div className="flex items-center justify-between text-lg text-[#475569]">
              <p>
                Mostrando {filteredAndSortedOrders.length} de {orders.length}{" "}
                remitos
              </p>
              {(filterType !== "all" || sortBy !== "date-desc") && (
                <button
                  onClick={() => {
                    setFilterType("all");
                    setSortBy("date-desc");
                  }}
                  className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-lg"
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Lista de órdenes */}
          <div className="space-y-4">
            {filteredAndSortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                clientName={clientMap.get(order.id)}
                onView={() => handleView(order)}
                onEdit={() => handleEdit(order)}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </>
      )}

      <OrderFormModal
        isOpen={formModal.isOpen}
        order={formModal.order}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      <OrderDetailModal
        isOpen={detailModal.isOpen}
        order={detailModal.order}
        onClose={handleDetailClose}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="¿Eliminar remito?"
        message={`Está por eliminar este remito de ${deleteModal.type}. El stock se revertirá automáticamente.`}
        itemName={`Remito #${deleteModal.id}`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
