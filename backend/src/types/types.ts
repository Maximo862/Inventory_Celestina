import { RowDataPacket } from 'mysql2';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: 'admin' | 'employee';
        email?: string;
      };
    }
  }
}
export { };
// Order Types
export type OrderType = 'entry' | 'exit';

export interface Order {
  id: number;
  type: OrderType;
  client_id: number | null;
  notes: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
}

// DTOs para crear órdenes
export interface CreateOrderDTO {
  type: OrderType;
  client_id?: number | null;
  notes?: string;
  items: CreateOrderItemDTO[];
}

export interface CreateOrderItemDTO {
  product_id: number;
  quantity: number;
  price: number;
}

export interface UpdateOrderDTO {
  client_id?: number | null;
  notes?: string;
}

// Para visualización con detalles expandidos
export interface OrderWithDetails extends Order {
  client_name?: string;
  items: OrderItemWithProduct[];
}

export interface OrderItemWithProduct extends OrderItem {
  product_name: string;
}

export interface UserDB {
  id: number;
  email: string;
  password?: string;
  role: 'admin' | 'employee';
}

export type DecodedToken = {
  id: number;
  role: 'admin' | 'employee';
};

// Category Types
export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryDTO {
  name: string;
  parent_id?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  parent_id?: number;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  category_id: number | null;
  created_at: Date;
  updated_at: Date;
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

// Client Types
export interface Client {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  cuil: string;
  tax_condition: string;
  created_at: Date;
  updated_at: Date;
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

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database Types
export interface CategoryRow extends RowDataPacket, Category { }
export interface ProductRow extends RowDataPacket, Product { }
export interface ClientRow extends RowDataPacket, Client { }