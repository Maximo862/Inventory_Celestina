import { fetchAPI } from "@/utils/fetchHelper";
import type {
    Product,
    CreateProductDTO,
    UpdateProductDTO,
    PaginatedResponse,
    PaginationParams,
} from "@/types/types";

export const getAllProductsRequest = (params?: PaginationParams) => {
    const queryString = params
        ? `?page=${params.page || 1}&limit=${params.limit || 10}`
        : "";

    return fetchAPI<PaginatedResponse<Product>>(`/products${queryString}`);
};

export const getProductByIdRequest = (id: number) =>
    fetchAPI<Product>(`/products/${id}`);

export const createProductRequest = (data: CreateProductDTO) =>
    fetchAPI<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateProductRequest = (id: number, data: UpdateProductDTO) =>
    fetchAPI<Product>(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const deleteProductRequest = (id: number) =>
    fetchAPI<void>(`/products/${id}`, {
        method: "DELETE",
    });