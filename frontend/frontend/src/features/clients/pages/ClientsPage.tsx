import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmpityState";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ClientCard } from "../components/ClientCard";
import { ClientFormModal } from "../components/ClientFormModal";
import { useClients } from "../context/ClientContext";
import { useClientActions } from "../hooks/useClientActions";
import { IoMdPerson } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import type { Client } from "@/types/types";

type SortOption = "name-asc" | "name-desc" | "cuil-asc" | "cuil-desc";

export function ClientsPage() {
  const { clients, loading } = useClients()!;
  const { createClient, updateClient, deleteClient } = useClientActions();

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

  // Filtrado y ordenamiento
  const filteredAndSortedClients = useMemo(() => {
    let result = clients.filter((client) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        client.name.toLowerCase().includes(searchLower) ||
        client.cuil.includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.includes(searchTerm)
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "cuil-asc":
          return a.cuil.localeCompare(b.cuil);
        case "cuil-desc":
          return b.cuil.localeCompare(a.cuil);
        default:
          return 0;
      }
    });

    return result;
  }, [clients, searchTerm, sortBy]);

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
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, id: null, name: "" });
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
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
            className="flex items-center justify-center gap-3"
          >
            <FaPlus className="text-2xl " />
            Nuevo cliente
          </Button>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={<IoMdPerson />}
          title="No hay clientes"
          description="Comience agregando su primer cliente al sistema"
          actionLabel="Crear primer cliente"
          onAction={handleCreate}
        />
      ) : (
        <>
          {/* Barra de búsqueda y filtros */}
          <div className="mb-6 space-y-4">
            {/* Búsqueda */}
            <div>
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, CUIL, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
              />
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
              >
                <option value="name-asc">🔤 Nombre (A → Z)</option>
                <option value="name-desc">🔤 Nombre (Z → A)</option>
                <option value="cuil-asc">🔢 CUIL (menor → mayor)</option>
                <option value="cuil-desc">🔢 CUIL (mayor → menor)</option>
              </select>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-between text-lg text-[#475569]">
              <p>
                Mostrando {filteredAndSortedClients.length} de {clients.length}{" "}
                clientes
              </p>
              {(searchTerm || sortBy !== "name-asc") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("name-asc");
                  }}
                  className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-lg"
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Lista de clientes */}
          {filteredAndSortedClients.length === 0 ? (
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
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={() => handleEdit(client)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ClientFormModal
        isOpen={formModal.isOpen}
        client={formModal.client}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="¿Eliminar cliente?"
        message="Está por eliminar el cliente:"
        itemName={deleteModal.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
