import { fetchAPI } from "@/utils/fetchHelper";
import type {
    Product,
    CreateProductDTO,
    UpdateProductDTO,
    PaginatedResponse,
    PaginationParams,
    SortParams,
} from "@/types/types";

export const getAllProductsRequest = (
    params?: PaginationParams & { search?: string; category_id?: number } & SortParams
) => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", (params?.page || 1).toString());
    queryParams.append("limit", (params?.limit || 10).toString());

    if (params?.search) {
        queryParams.append("search", params.search);
    }

    if (params?.category_id) {
        queryParams.append("category_id", params.category_id.toString());
    }

    if (params?.sort) {
        queryParams.append("sort", params.sort);
    }

    if (params?.order) {
        queryParams.append("order", params.order);
    }

    return fetchAPI<PaginatedResponse<Product>>(
        `/products?${queryParams.toString()}`
    );
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