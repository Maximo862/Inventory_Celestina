import { useProducts } from "../context/ProductContext";
import {
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
  getProductByIdRequest,
} from "../api/ProductsRequest";
import type {
  CreateProductDTO,
  UpdateProductDTO,
  Product,
} from "@/types/types";
import toast from "react-hot-toast";
import { handleError } from "@/utils/errorHandler";

export function useProductActions() {
  const { refreshProducts, pagination } = useProducts();

  async function getProductById(id: number): Promise<Product> {
    try {
      const product = await getProductByIdRequest(id);
      return product;
    } catch (error) {
      handleError(error, "obtener");
      throw error;
    }
  }

  async function createProduct(product: CreateProductDTO) {
    try {
      await createProductRequest(product);
      // ← Mantener página actual
      await refreshProducts({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      });
      toast.success("Producto creado exitosamente");
    } catch (error) {
      handleError(error, "crear");
      throw error;
    }
  }

  async function updateProduct(id: number, product: UpdateProductDTO) {
    try {
      await updateProductRequest(id, product);
      // ← Mantener página actual
      await refreshProducts({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      });
      toast.success("Producto actualizado exitosamente");
    } catch (error) {
      handleError(error, "actualizar");
      throw error;
    }
  }

  async function deleteProduct(id: number) {
    try {
      await deleteProductRequest(id);
      // ← Mantener página actual
      await refreshProducts({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
      });
      toast.success("Producto eliminado exitosamente");
    } catch (error) {
      handleError(error, "eliminar");
      throw error;
    }
  }

  return {
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
