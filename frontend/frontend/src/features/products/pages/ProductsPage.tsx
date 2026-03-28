import { useState, useMemo, useContext, useEffect } from "react";
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
import { AuthContext } from "@/features/auth/context/AuthContext";
import { FaBox, FaPlus } from "react-icons/fa6";
import { FiChevronLeft, FiChevronRight, FiDollarSign, FiClock, FiFolder } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import type { Product } from "@/types/types";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "quantity-asc"
  | "quantity-desc"
  | "created_at-asc"
  | "created_at-desc";

const SORT_OPTIONS: Record<SortOption, { sort: string; order: 'asc' | 'desc' }> = {
  "name-asc": { sort: "name", order: "asc" },
  "name-desc": { sort: "name", order: "desc" },
  "price-asc": { sort: "price", order: "asc" },
  "price-desc": { sort: "price", order: "desc" },
  "quantity-asc": { sort: "quantity", order: "asc" },
  "quantity-desc": { sort: "quantity", order: "desc" },
  "created_at-asc": { sort: "created_at", order: "asc" },
  "created_at-desc": { sort: "created_at", order: "desc" },
};

export function ProductsPage() {
  const { products, loading, pagination, loadProducts } = useProducts()!;
  const { createProduct, updateProduct, deleteProduct } = useProductActions();
  const { categories } = useCategories()!;
  const { user } = useContext(AuthContext)!;

  const isAdmin = user?.role === "admin";

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

  // ← ESTADOS: Búsqueda y filtro (SERVER-SIDE)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const isFiltering = searchTerm || filterCategory !== "all";

  // ← DEBOUNCE
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // ← ESTADOS: Ordenamiento (SERVER-SIDE) y paginación
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ← CARGAR productos cuando cambian: página, búsqueda, filtro o sort
  useEffect(() => {
    const sortConfig = SORT_OPTIONS[sortBy];
    loadProducts({
      page: currentPage,
      limit: itemsPerPage,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filterCategory !== "all" && { category_id: parseInt(filterCategory) }),
      sort: sortConfig.sort,
      order: sortConfig.order,
    });
  }, [currentPage, debouncedSearch, filterCategory, sortBy]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const parentCategories = useMemo(() => {
    return categories.filter((cat) => cat.parent_id === null);
  }, [categories]);

  const getSubcategories = (parentId: number) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

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
    const sortConfig = SORT_OPTIONS[sortBy];
    loadProducts({
      page: currentPage,
      limit: itemsPerPage,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filterCategory !== "all" && { category_id: parseInt(filterCategory) }),
      sort: sortConfig.sort,
      order: sortConfig.order,
    });
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
      const sortConfig = SORT_OPTIONS[sortBy];
      loadProducts({
        page: currentPage,
        limit: itemsPerPage,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filterCategory !== "all" && { category_id: parseInt(filterCategory) }),
        sort: sortConfig.sort,
        order: sortConfig.order,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, id: null, name: "" });
  };

  // ← Handlers de búsqueda/filtro
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value);
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
        title="Productos"
        subtitle="Gestión del inventario de productos"
        action={
          isAdmin ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreate}
              className="flex items-center justify-center gap-3"
            >
              <FaPlus className="text-2xl" />
              Nuevo producto
            </Button>
          ) : undefined
        }
      />

      {pagination && pagination.total === 0 && !isFiltering
        ? (
          <EmptyState
            icon={<FaBox />}
            title="No hay productos"
            description="Comience agregando su primer producto al inventario"
            actionLabel="Crear primer producto"
            onAction={handleCreate}
            showAction={isAdmin}
          />
        ) : (
          <>
            <div className="mb-6 space-y-4">
              {/* ← BÚSQUEDA (SERVER-SIDE) */}
              <div>
                <input
                  type="text"
                  placeholder="Buscar producto por nombre..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ← FILTRO POR CATEGORÍA (SERVER-SIDE) */}
                <div>
                  <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                    Filtrar por categoría
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
                  >
                    <option value="all"><FiFolder /> Todas las categorías</option>

                    {parentCategories.map((parent) => {
                      const subs = getSubcategories(parent.id);

                      return (
                        <optgroup key={parent.id} label={parent.name}>
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

                {/* ← ORDENAR (SERVER-SIDE) */}
                <div>
                  <label className="block text-[#0F172A] text-lg font-semibold mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as SortOption);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
                  >
                    <option value="name-asc">Nombre (A → Z)</option>
                    <option value="name-desc">Nombre (Z → A)</option>
                    <option value="price-asc"><FiDollarSign /> Precio (menor → mayor)</option>
                    <option value="price-desc"><FiDollarSign /> Precio (mayor → menor)</option>
                    <option value="quantity-asc"><FaBox /> Stock (menor → mayor)</option>
                    <option value="quantity-desc"><FaBox /> Stock (mayor → menor)</option>
                    <option value="created_at-desc"><FiClock /> Más reciente</option>
                    <option value="created_at-asc"><FiClock /> Más antiguo</option>
                  </select>
                </div>
              </div>

              {pagination && (
                <div className="flex items-center justify-between text-lg text-[#64748B]">
                  <p>
                    Mostrando {products.length} de {pagination.total}{" "}
                    productos totales (Página {currentPage} de{" "}
                    {pagination.totalPages})
                  </p>
                  {(debouncedSearch ||
                    filterCategory !== "all" ||
                    sortBy !== "name-asc") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setDebouncedSearch("");
                          setFilterCategory("all");
                          setSortBy("name-asc");
                          setCurrentPage(1);
                        }}
                        className="text-[#4FA3D1] hover:text-[#3D8AB5] font-semibold text-lg"
                      >
                        <IoMdClose /> Limpiar filtros
                      </button>
                    )}
                </div>
              )}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl text-[#64748B] mb-4">
                  No se encontraron productos
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearch("");
                    setFilterCategory("all");
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
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={
                        product.category_id
                          ? categoryMap.get(product.category_id)
                          : undefined
                      }
                      isAdmin={isAdmin}
                      onEdit={() => handleEdit(product)}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border-2 border-[#E2E8F0]">
                    <p className="text-lg text-[#64748B] font-semibold">
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
                                  ? "bg-[#4FA3D1] text-white"
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
        <ProductFormModal
          isOpen={formModal.isOpen}
          product={formModal.product}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {isAdmin && (
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          title="¿Eliminar producto?"
          message="Está por eliminar el producto:"
          itemName={deleteModal.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}