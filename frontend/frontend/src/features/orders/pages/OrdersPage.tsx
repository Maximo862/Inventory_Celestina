import { useState, useMemo, useEffect } from "react";
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
import { FiPlus, FiFileText, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Order, OrderWithDetails } from "@/types/types";

type FilterOption = "all" | "entry" | "exit";
type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export function OrdersPage() {
  const { orders, loading, pagination, loadOrders } = useOrders();
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

  // ← ESTADOS: Búsqueda y filtro (SERVER-SIDE)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterOption>("all");

  // ← ESTADOS: Ordenamiento (CLIENT-SIDE) y paginación
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ← CARGAR orders cuando cambian: página, búsqueda o filtro
  useEffect(() => {
    loadOrders({
      page: currentPage,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(filterType !== "all" && { type: filterType }),
    });
  }, [currentPage, searchTerm, filterType]);

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

  // ← ORDENAMIENTO CLIENT-SIDE (solo sobre los orders de la página actual)
  const sortedOrders = useMemo(() => {
    let result = [...orders];

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
  }, [orders, sortBy]);

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
    // Recargar con filtros actuales
    loadOrders({
      page: currentPage,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(filterType !== "all" && { type: filterType }),
    });
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
      // Recargar con filtros actuales
      loadOrders({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== "all" && { type: filterType }),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, id: null, type: "" });
  };

  // ← Handlers de búsqueda/filtro: Reset a página 1
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilterType(newFilter);
    setCurrentPage(1);
  };

  // Handlers de paginación
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      {pagination && pagination.total === 0 ? (
        <EmptyState
          icon={<FiFileText />}
          title="No hay remitos"
          description="Comience registrando su primer remito de entrada o salida"
          actionLabel="Crear primer remito"
          onAction={handleCreate}
        />
      ) : (
        <>
          <div className="mb-6 space-y-4">
            {/* ← BÚSQUEDA (SERVER-SIDE) */}
            <div>
              <input
                type="text"
                placeholder="🔍 Buscar por cliente o notas..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ← FILTRO POR TIPO (SERVER-SIDE) */}
              <div>
                <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                  Filtrar por tipo
                </label>
                <select
                  value={filterType}
                  onChange={(e) =>
                    handleFilterChange(e.target.value as FilterOption)
                  }
                  className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
                >
                  <option value="all">📁 Todos los remitos</option>
                  <option value="entry">📥 Solo entradas</option>
                  <option value="exit">📤 Solo salidas</option>
                </select>
              </div>

              {/* ← ORDENAR (CLIENT-SIDE) */}
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

            {pagination && (
              <div className="flex items-center justify-between text-lg text-[#475569]">
                <p>
                  Mostrando {sortedOrders.length} de {pagination.total} remitos
                  totales (Página {currentPage} de {pagination.totalPages})
                </p>
                {(searchTerm || filterType !== "all" || sortBy !== "date-desc") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                      setSortBy("date-desc");
                      setCurrentPage(1);
                    }}
                    className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-lg"
                  >
                    ✕ Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-[#475569] mb-4">
                No se encontraron remitos
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setSortBy("date-desc");
                  setCurrentPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {sortedOrders.map((order) => (
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

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border-2 border-[#E2E8F0]">
                  <p className="text-lg text-[#475569] font-semibold">
                    Página {currentPage} de {pagination.totalPages}
                  </p>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2"
                    >
                      <FiChevronLeft className="text-xl" />
                      Anterior
                    </Button>

                    <div className="hidden sm:flex gap-2">
                      {Array.from(
                        { length: Math.min(pagination.totalPages, 5) },
                        (_, i) => {
                          let pageNumber;
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNumber = pagination.totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageClick(pageNumber)}
                              className={`px-4 py-2 rounded-lg text-lg font-semibold transition-colors ${currentPage === pageNumber
                                  ? "bg-[#2563EB] text-white"
                                  : "bg-white text-[#0F172A] border-2 border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleNextPage}
                      disabled={currentPage === pagination.totalPages}
                      className="flex items-center gap-2"
                    >
                      Siguiente
                      <FiChevronRight className="text-xl" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
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
