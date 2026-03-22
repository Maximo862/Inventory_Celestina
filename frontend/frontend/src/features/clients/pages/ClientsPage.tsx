import { useState, useContext, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmpityState";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ClientCard } from "../components/ClientCard";
import { ClientFormModal } from "../components/ClientFormModal";
import { useClients } from "../context/ClientContext";
import { useClientActions } from "../hooks/useClientActions";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { IoMdPerson } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import type { Client } from "@/types/types";

type SortOption = "name-asc" | "name-desc" | "cuil-asc" | "cuil-desc";

export function ClientsPage() {
  const { clients, loading, pagination, loadClients } = useClients()!;
  const { createClient, updateClient, deleteClient } = useClientActions();
  const { user } = useContext(AuthContext)!;

  const isAdmin = user?.role === "admin";

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    client: Client | null;
  }>({
    isOpen: false,
    client: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ← Mapear sortBy a sortField y sortOrder
  const getSortParams = (sortOption: SortOption) => {
    const sortMap: Record<SortOption, { field: string; order: 'ASC' | 'DESC' }> = {
      'name-asc': { field: 'name', order: 'ASC' },
      'name-desc': { field: 'name', order: 'DESC' },
      'cuil-asc': { field: 'cuil', order: 'ASC' },
      'cuil-desc': { field: 'cuil', order: 'DESC' },
    };
    return sortMap[sortOption];
  };

  // ← Cargar cuando cambian: página, búsqueda u ordenamiento
  useEffect(() => {
    const { field, order } = getSortParams(sortBy);
    loadClients({
      page: currentPage,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      sortField: field,
      sortOrder: order,
    });
  }, [currentPage, searchTerm, sortBy]);

  const handleCreate = () => {
    setFormModal({ isOpen: true, client: null });
  };

  const handleEdit = (client: Client) => {
    setFormModal({ isOpen: true, client });
  };

  const handleFormSubmit = async (data: any) => {
    if (formModal.client) {
      await updateClient(formModal.client.id, data);
    } else {
      await createClient(data);
    }
    const { field, order } = getSortParams(sortBy);
    loadClients({
      page: currentPage,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      sortField: field,
      sortOrder: order,
    });
  };

  const handleFormClose = () => {
    setFormModal({ isOpen: false, client: null });
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      await deleteClient(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: "" });
      const { field, order } = getSortParams(sortBy);
      loadClients({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        sortField: field,
        sortOrder: order,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, id: null, name: "" });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

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
        title="Clientes"
        subtitle="Gestión de clientes de la maderería"
        action={
          isAdmin ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreate}
              className="flex items-center justify-center gap-3"
            >
              <FaPlus className="text-2xl" />
              Nuevo cliente
            </Button>
          ) : undefined
        }
      />

      {pagination && pagination.total === 0 ? (
        <EmptyState
          icon={<IoMdPerson />}
          title="No hay clientes"
          description="Comience agregando su primer cliente al sistema"
          actionLabel="Crear primer cliente"
          onAction={handleCreate}
        />
      ) : (
        <>
          <div className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Buscar por nombre, CUIL, email o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
              />
            </div>

            <div>
              <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="w-full sm:w-auto bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
              >
                <option value="name-asc">Nombre (A → Z)</option>
                <option value="name-desc">Nombre (Z → A)</option>
                <option value="cuil-asc">CUIL (menor → mayor)</option>
                <option value="cuil-desc">CUIL (mayor → menor)</option>
              </select>
            </div>

            {pagination && (
              <div className="flex items-center justify-between text-lg text-[#475569]">
                <p>
                  Mostrando {clients.length} de {pagination.total} clientes
                  totales (Página {currentPage} de {pagination.totalPages})
                </p>
                {(searchTerm || sortBy !== "name-asc") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSortBy("name-asc");
                      setCurrentPage(1);
                    }}
                    className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-lg"
                  >
                    <IoMdClose /> Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-[#475569] mb-4">
                No se encontraron clientes
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("name-asc");
                  setCurrentPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {clients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    isAdmin={isAdmin}
                    onEdit={() => handleEdit(client)}
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

      {isAdmin && (
        <ClientFormModal
          isOpen={formModal.isOpen}
          client={formModal.client}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {isAdmin && (
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          title="¿Eliminar cliente?"
          message="Está por eliminar el cliente:"
          itemName={deleteModal.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}