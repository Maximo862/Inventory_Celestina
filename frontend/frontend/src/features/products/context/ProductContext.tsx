import { createContext, useContext, useEffect, useState } from "react";
import { getAllProductsRequest } from "../api/ProductsRequest";
import type { Product, PaginationParams, SortParams } from "@/types/types";
import { useAuth } from "@/features/auth/context/AuthContext";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  pagination: PaginationInfo | null;
  loadProducts: (
    params: PaginationParams & { search?: string; category_id?: number } & SortParams
  ) => Promise<void>;
  refreshProducts: (
    params: PaginationParams & { search?: string; category_id?: number } & SortParams
  ) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      loadProducts({ page: 1, limit: 10 });
    }
  }, [authLoading, user]);

  async function loadProducts(
    params: PaginationParams & { search?: string; category_id?: number } & SortParams
  ) {
    try {
      setLoading(true);
      const res = await getAllProductsRequest(params);
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshProducts(
    params: PaginationParams & { search?: string; category_id?: number } & SortParams
  ) {
    await loadProducts(params);
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        pagination,
        loadProducts,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }

  return context;
}


