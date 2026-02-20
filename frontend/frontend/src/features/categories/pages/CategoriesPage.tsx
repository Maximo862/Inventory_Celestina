import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmpityState";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { CategoryCard } from "../components/CategoryCard";
import { CategoryFormModal } from "../components/CategoriesFormModal";
import { useCategories } from "../context/CategoryContext";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { FaPlus } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";
import type { Category } from "@/types/types";

type SortOption = "name-asc" | "name-desc" | "id-asc" | "id-desc";

export function CategoriesPage() {
  const { categories, loading } = useCategories()!;
  const { createCategory, updateCategory, deleteCategory } =
    useCategoryActions();

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
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
  const filteredAndSortedCategories = useMemo(() => {
    let result = categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "id-asc":
          return a.id - b.id;
        case "id-desc":
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return result;
  }, [categories, searchTerm, sortBy]);

  const handleCreate = () => {
    setFormModal({ isOpen: true, category: null });
  };

  const handleEdit = (category: Category) => {
    setFormModal({ isOpen: true, category });
  };

  const handleFormSubmit = async (data: { name: string }) => {
    if (formModal.category) {
      await updateCategory(formModal.category.id, data);
    } else {
      await createCategory(data);
    }
  };

  const handleFormClose = () => {
    setFormModal({ isOpen: false, category: null });
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      await deleteCategory(deleteModal.id);
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
        title="Categorías"
        subtitle="Gestión de categorías de productos"
        action={
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
            className="flex items-center justify-center gap-3"
          >
            <FaPlus className="text-2xl " />
            Nueva categoría
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={<GiTicket />}
          title="No hay categorías"
          description="Comience creando su primera categoría para organizar los productos"
          actionLabel="Crear primera categoría"
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
                placeholder="🔍 Buscar categoría por nombre..."
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
                <option value="id-asc">🔢 Más antigua primero</option>
                <option value="id-desc">🔢 Más reciente primero</option>
              </select>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-between text-lg text-[#475569]">
              <p>
                Mostrando {filteredAndSortedCategories.length} de{" "}
                {categories.length} categorías
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

          {/* Lista de categorías */}
          {filteredAndSortedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-[#475569] mb-4">
                No se encontraron categorías
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
              {filteredAndSortedCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={() => handleEdit(category)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      <CategoryFormModal
        isOpen={formModal.isOpen}
        category={formModal.category}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="¿Eliminar categoría?"
        message="Está por eliminar la categoría:"
        itemName={deleteModal.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
