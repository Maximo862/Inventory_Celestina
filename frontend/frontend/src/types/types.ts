export interface User {
  id?: number;
  email: string;
  password: string;
  created_at?: string;
}

// ============================================
// CATEGORY TYPES
// ============================================
export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDTO {
  name: string;
}

export interface UpdateCategoryDTO {
  name?: string;
}

// ============================================
// PRODUCT TYPES
// ============================================
export interface Product {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  category_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  category_id?: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  category_id?: number;
}

// ============================================
// CLIENT TYPES
// ============================================
export interface Client {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  cuil: string;
  tax_condition: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientDTO {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  cuil: string;
  tax_condition: string;
}

export interface UpdateClientDTO {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  cuil?: string;
  tax_condition?: string;
}

// ============================================
// PAGINATION TYPES
// ============================================
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}