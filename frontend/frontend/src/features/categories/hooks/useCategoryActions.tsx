import { useCategories } from "../context/CategoryContext";
import {
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
  getCategoryByIdRequest,
  previewPriceAdjustmentRequest,
  applyPriceAdjustmentRequest,
} from "../api/CategoriesRequest";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  Category,
  PricePreviewResult,
  PriceUpdateResult,
} from "@/types/types";
import toast from "react-hot-toast";
import { handleError } from "@/utils/errorHandler";

export function useCategoryActions() {
  const { refreshCategories } = useCategories();

  async function getCategoryById(id: number): Promise<Category> {
    try {
      const category = await getCategoryByIdRequest(id);
      return category;
    } catch (error) {
      handleError(error, "obtener");
      throw error;
    }
  }

  async function createCategory(category: CreateCategoryDTO) {
    try {
      await createCategoryRequest(category);
      await refreshCategories();
      toast.success("Categoría creada exitosamente");
    } catch (error) {
      handleError(error, "crear");
      throw error;
    }
  }

  async function updateCategory(id: number, category: UpdateCategoryDTO) {
    try {
      await updateCategoryRequest(id, category);
      await refreshCategories();
      toast.success("Categoría actualizada exitosamente");
    } catch (error) {
      handleError(error, "actualizar");
      throw error;
    }
  }

  async function deleteCategory(id: number) {
    try {
      await deleteCategoryRequest(id);
      await refreshCategories();
      toast.success("Categoría eliminada exitosamente");
    } catch (error) {
      handleError(error, "eliminar");
      throw error;
    }
  }

  async function previewPriceAdjustment(
    id: number,
    percentage: number
  ): Promise<PricePreviewResult> {
    try {
      const result = await previewPriceAdjustmentRequest(id, percentage);
      return result;
    } catch (error) {
      handleError(error, "obtener preview de precios");
      throw error;
    }
  }

  async function applyPriceAdjustment(
    id: number,
    percentage: number
  ): Promise<PriceUpdateResult> {
    try {
      const result = await applyPriceAdjustmentRequest(id, percentage);
      await refreshCategories();
      toast.success(
        `Precios actualizados en ${result.affectedProducts} producto${result.affectedProducts !== 1 ? "s" : ""}`
      );
      return result;
    } catch (error) {
      handleError(error, "aplicar ajuste de precios");
      throw error;
    }
  }

  return {
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    previewPriceAdjustment,
    applyPriceAdjustment,
  };
}
