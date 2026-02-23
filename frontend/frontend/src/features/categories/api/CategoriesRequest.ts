import { fetchAPI } from "@/utils/fetchHelper";
import type {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  PaginatedResponse,
  PaginationParams,
} from "@/types/types";

export const getAllCategoriesRequest = (params?: PaginationParams) => {
  const queryString = params
    ? `?page=${params.page || 1}&limit=${params.limit || 10}`
    : "";

  return fetchAPI<PaginatedResponse<Category>>(`/categories${queryString}`);
};

export const getParentCategoriesRequest = () =>
  fetchAPI<Category[]>("/categories/parents");

export const getSubcategoriesRequest = (parentId: number) =>
  fetchAPI<Category[]>(`/categories/${parentId}/subcategories`);

export const getCategoryByIdRequest = (id: number) =>
  fetchAPI<Category>(`/categories/${id}`);

export const createCategoryRequest = (data: CreateCategoryDTO) =>
  fetchAPI<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCategoryRequest = (id: number, data: UpdateCategoryDTO) =>
  fetchAPI<Category>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteCategoryRequest = (id: number) =>
  fetchAPI<void>(`/categories/${id}`, {
    method: "DELETE",
  });