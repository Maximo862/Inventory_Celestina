import { useContext } from "react";
import { CategoryContext } from "../context/CategoryContext";
import {
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
  getCategoryByIdRequest,
} from "../api/CategoriesRequest";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  Category,
} from "@/types/types";
import toast from "react-hot-toast";
import { handleError } from "@/utils/errorHandler";

export function useCategoryActions() {
  const context = useContext(CategoryContext);

  if (!context) {
    throw new Error("useCategoryActions must be used within CategoryProvider");
  }

  const { refreshCategories } = context;

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

  return {
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
