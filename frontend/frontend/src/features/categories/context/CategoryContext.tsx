import { createContext, useEffect, useState, useMemo, useContext } from "react";
import { getAllCategoriesRequest } from "../api/CategoriesRequest";
import type { Category } from "@/types/types";
import { useAuth } from "@/features/auth/context/AuthContext";

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  refreshCategories: () => Promise<void>;
  parentCategories: Category[]; // ← NUEVO: filtrado local
  getSubcategories: (parentId: number) => Category[]; // ← NUEVO
}

export const CategoryContext = createContext<CategoryContextType | null>(null);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      loadCategories();
    }
  }, [authLoading, user]);

  async function loadCategories() {
    try {
      setLoading(true);
      const res = await getAllCategoriesRequest();
      setCategories(res.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshCategories() {
    await loadCategories();
  }

  // ← NUEVO: Filtrar categorías padre en memoria
  const parentCategories = useMemo(() => {
    return categories.filter((cat) => cat.parent_id === null);
  }, [categories]);

  // ← NUEVO: Obtener subcategorías de un padre
  const getSubcategories = (parentId: number) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        refreshCategories,
        parentCategories,
        getSubcategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);

  if (!context) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }

  return context;
}
