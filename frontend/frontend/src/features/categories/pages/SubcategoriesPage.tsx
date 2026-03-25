import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmpityState";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { SubcategoryCard } from "../components/SubcategoryCard";
import { SubcategoryFormModal } from "../components/SubcategoryFormModal";
import { PriceAdjustmentModal } from "../components/PriceAdjustmentModal";
import { useCategories } from "../context/CategoryContext";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { MdCategory } from "react-icons/md";
import type { Category } from "@/types/types";

type SortOption = "name-asc" | "name-desc" | "id-asc" | "id-desc";

export function SubcategoriesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const { categories, getSubcategories, loading } = useCategories()!;
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    previewPriceAdjustment,
    applyPriceAdjustment,
  } = useCategoryActions();

  const parentCategory = useMemo(() => {
    return categories.find((cat) => cat.id === Number(categoryId));
  }, [categories, categoryId]);

  const subcategories = useMemo(() => {
    if (!categoryId) return [];
    return getSubcategories(Number(categoryId));
  }, [categoryId, getSubcategories]);

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    subcategory: Category | null;
  }>({
    isOpen: false,
    subcategory: null,
  });

  const [priceModal, setPriceModal] = useState<{
    isOpen: boolean;
    subcategory: Category | null;
  }>({
    isOpen: false,
    subcategory: null,
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

  const filteredAndSortedSubcategories = useMemo(() => {
    let result = subcategories.filter((sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
  }, [subcategories, searchTerm, sortBy]);

  const handleCreate = () => {
    setFormModal({ isOpen: true, subcategory: null });
  };

  const handleEdit = (subcategory: Category) => {
    setFormModal({ isOpen: true, subcategory });
  };

  const handleFormSubmit = async (data: {
    name: string;
    parent_id: number;
  }) => {
    if (formModal.subcategory) {
      await updateCategory(formModal.subcategory.id, { name: data.name });
    } else {
      await createCategory(data);
    }
  };

  const handleFormClose = () => {
    setFormModal({ isOpen: false, subcategory: null });
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

  const handlePriceAdjustment = (subcategory: Category) => {
    setPriceModal({ isOpen: true, subcategory });
  };

  const handlePriceClose = () => {
    setPriceModal({ isOpen: false, subcategory: null });
  };

  const handlePricePreview = async (id: number, percentage: number) => {
    return previewPriceAdjustment(id, percentage);
  };

  const handlePriceApply = async (id: number, percentage: number) => {
    await applyPriceAdjustment(id, percentage);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!parentCategory) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-[#DC2626] mb-4">Categoria no encontrada</p>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate("/categories")}
          className="flex items-center justify-center gap-2"
        >
          <FiArrowLeft className="text-xl" />
          Volver a categorias
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/categories")}
              className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
              aria-label="Volver a categorias"
            >
              <FiArrowLeft className="text-3xl text-[#64748B]" />
            </button>
            <div>
              <p className="text-lg text-[#64748B] mb-1">Subcategorias de:</p>
              <h1 className="text-4xl font-bold text-[#0F172A]">
                {parentCategory.name}
              </h1>
            </div>
          </div>
        }
        subtitle="Gestion de subcategorias"
        action={
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
            className="flex items-center justify-center gap-3"
          >
            <FiPlus className="text-2xl" />
            Nueva subcategoria
          </Button>
        }
      />

      {subcategories.length === 0 ? (
        <EmptyState
          icon={<MdCategory />}
          title="No hay subcategorias"
          description={`Comience creando la primera subcategoria de ${parentCategory.name}`}
          actionLabel="Crear primera subcategoria"
          onAction={handleCreate}
        />
      ) : (
        <>
          <div className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Buscar subcategoria por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
              />
            </div>

            <div>
              <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
              >
                <option value="name-asc">Nombre (A → Z)</option>
                <option value="name-desc">Nombre (Z → A)</option>
                <option value="id-asc">Mas antigua primero</option>
                <option value="id-desc">Mas reciente primero</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-lg text-[#64748B]">
              <p>
                Mostrando {filteredAndSortedSubcategories.length} de{" "}
                {subcategories.length} subcategorias
              </p>
              {(searchTerm || sortBy !== "name-asc") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("name-asc");
                  }}
                  className="text-[#4FA3D1] hover:text-[#3D8AB5] font-semibold text-lg"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {filteredAndSortedSubcategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-[#64748B] mb-4">
                No se encontraron subcategorias
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
              {filteredAndSortedSubcategories.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  onEdit={() => handleEdit(subcategory)}
                  onDelete={handleDeleteClick}
                  onPriceAdjustment={handlePriceAdjustment}
                />
              ))}
            </div>
          )}
        </>
      )}

      {parentCategory && (
        <SubcategoryFormModal
          isOpen={formModal.isOpen}
          subcategory={formModal.subcategory}
          parentCategory={parentCategory}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Eliminar subcategoria?"
        message="Esta por eliminar la subcategoria:"
        itemName={deleteModal.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      {priceModal.subcategory && (
        <PriceAdjustmentModal
          isOpen={priceModal.isOpen}
          category={priceModal.subcategory}
          onClose={handlePriceClose}
          onPreview={handlePricePreview}
          onApply={handlePriceApply}
        />
      )}
    </div>
  );
}
