import { useContext } from "react";
import { ProductContext } from "../context/ProductContext";
import {
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
  getProductByIdRequest,
} from "../api/ProductsRequest";
import type { CreateProductDTO, UpdateProductDTO, Product } from "@/types/types";
import toast from "react-hot-toast";
import { handleError } from "@/utils/errorHandler";

export function useProductActions() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProductActions must be used within ProductProvider");
  }

  const { refreshProducts } = context;

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
      await refreshProducts();
      toast.success("Producto creado exitosamente");
    } catch (error) {
      handleError(error, "crear");
      throw error;
    }
  }

  async function updateProduct(id: number, product: UpdateProductDTO) {
    try {
      await updateProductRequest(id, product);
      await refreshProducts();
      toast.success("Producto actualizado exitosamente");
    } catch (error) {
      handleError(error, "actualizar");
      throw error;
    }
  }

  async function deleteProduct(id: number) {
    try {
      await deleteProductRequest(id);
      await refreshProducts();
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