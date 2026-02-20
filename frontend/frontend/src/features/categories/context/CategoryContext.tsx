import { createContext, useContext, useEffect, useState } from "react";
import { getAllCategoriesRequest } from "../api/CategoriesRequest";
import type { Category } from "@/types/types";

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  refreshCategories: () => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType | null>(null);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

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

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
    return useContext(CategoryContext)
}