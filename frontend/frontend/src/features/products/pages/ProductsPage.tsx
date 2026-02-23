import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmpityState";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { ProductCard } from "../components/ProductCard";
import { ProductFormModal } from "../components/ProductFormModal";
import { useProducts } from "../context/ProductContext";
import { useProductActions } from "../hooks/useProductActions";
import { useCategories } from "@/features/categories/context/CategoryContext";
import { FaBox, FaPlus } from "react-icons/fa6";
import type { Product } from "@/types/types";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc";

export function ProductsPage() {
  const { products, loading } = useProducts()!;
  const { createProduct, updateProduct, deleteProduct } = useProductActions();
  const { categories } = useCategories()!;

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
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
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // NUEVO: Obtener categorías padre
  const parentCategories = useMemo(() => {
    return categories.filter((cat) => cat.parent_id === null);
  }, [categories]);

  // NUEVO: Función para obtener subcategorías de un padre
  const getSubcategories = (parentId: number) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  // Filtrado y ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === "all" ||
        product.category_id?.toString() === filterCategory;

      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-asc":
          return a.quantity - b.quantity;
        case "stock-desc":
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchTerm, filterCategory, sortBy]);

  const handleCreate = () => {
    setFormModal({ isOpen: true, product: null });
  };

  const handleEdit = (product: Product) => {
    setFormModal({ isOpen: true, product });
  };

  const handleFormSubmit = async (data: any) => {
    if (formModal.product) {
      await updateProduct(formModal.product.id, data);
    } else {
      await createProduct(data);
    }
  };

  const handleFormClose = () => {
    setFormModal({ isOpen: false, product: null });
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;

    setIsDeleting(true);
    try {
      await deleteProduct(deleteModal.id);
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
        title="Productos"
        subtitle="Gestión del inventario de productos"
        action={
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
            className="flex items-center justify-center gap-3"
          >
            <FaPlus className="text-2xl" />
            Nuevo producto
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<FaBox />}
          title="No hay productos"
          description="Comience agregando su primer producto al inventario"
          actionLabel="Crear primer producto"
          onAction={handleCreate}
        />
      ) : (
        <>
          <div className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="🔍 Buscar producto por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* NUEVO: Select con jerarquía visual usando optgroup */}
              <div>
                <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                  Filtrar por categoría
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
                >
                  <option value="all">📁 Todas las categorías</option>

                  {/* Renderizar jerarquía con optgroup */}
                  {parentCategories.map((parent) => {
                    const subs = getSubcategories(parent.id);

                    return (
                      <optgroup key={parent.id} label={`🏷️ ${parent.name}`}>
                        {/* Subcategorías con indentación */}
                        {subs.length > 0 ? (
                          subs.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              &nbsp;&nbsp;└─ {sub.name}
                            </option>
                          ))
                        ) : (
                          <option value={parent.id}>{parent.name}</option>
                        )}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition duration-200"
                >
                  <option value="name-asc">🔤 Nombre (A → Z)</option>
                  <option value="name-desc">🔤 Nombre (Z → A)</option>
                  <option value="price-asc">💰 Precio (menor → mayor)</option>
                  <option value="price-desc">💰 Precio (mayor → menor)</option>
                  <option value="stock-asc">📦 Stock (menor → mayor)</option>
                  <option value="stock-desc">📦 Stock (mayor → menor)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-lg text-[#475569]">
              <p>
                Mostrando {filteredAndSortedProducts.length} de{" "}
                {products.length} productos
              </p>
              {(searchTerm ||
                filterCategory !== "all" ||
                sortBy !== "name-asc") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("all");
                    setSortBy("name-asc");
                  }}
                  className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-lg"
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-[#475569] mb-4">
                No se encontraron productos
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                  setSortBy("name-asc");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={
                    product.category_id
                      ? categoryMap.get(product.category_id)
                      : undefined
                  }
                  onEdit={() => handleEdit(product)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ProductFormModal
        isOpen={formModal.isOpen}
        product={formModal.product}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="¿Eliminar producto?"
        message="Está por eliminar el producto:"
        itemName={deleteModal.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
