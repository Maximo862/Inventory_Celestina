import { pool } from '../db/db';
import { Product, PaginationParams, CreateProductDTO, UpdateProductDTO, SortParams, ProductSortableFields } from '../types/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface ProductRow extends RowDataPacket, Product { }

interface SearchProductRow extends RowDataPacket {
  id: number;
  name: string;
}

const ALLOWED_SORT_FIELDS: ProductSortableFields = {
  name: true,
  price: true,
  quantity: true,
  created_at: true
};

const ALLOWED_ORDER_VALUES = ['asc', 'desc'];

export class ProductRepository {
  async findAll(
    pagination: PaginationParams,
    branchId: number,
    filters?: { search?: string; category_id?: number },
    sortParams?: SortParams
  ): Promise<{ products: ProductRow[], total: number }> {
    const offset = (pagination.page - 1) * pagination.limit;

    const whereClauses: string[] = ['branch_id = ?'];
    const params: any[] = [branchId];

    if (filters?.search) {
      whereClauses.push('name LIKE ?');
      params.push(`%${filters.search}%`);
    }

    if (filters?.category_id) {
      whereClauses.push('category_id = ?');
      params.push(filters.category_id);
    }

    const whereSQL = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    const sortField = ALLOWED_SORT_FIELDS[sortParams?.sort as keyof ProductSortableFields]
      ? sortParams!.sort
      : 'id';
    const sortOrder = ALLOWED_ORDER_VALUES.includes(sortParams?.order?.toLowerCase() || '')
      ? sortParams!.order!.toUpperCase()
      : 'DESC';

    const productsQuery = `
      SELECT * FROM products 
      ${whereSQL}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [products] = await pool.query<ProductRow[]>(
      productsQuery,
      [...params, pagination.limit, offset]
    );

    // ← Query para contar total con los MISMOS filtros
    const countQuery = `
      SELECT COUNT(*) as total FROM products 
      ${whereSQL}
    `;

    const [countResult] = await pool.query<any[]>(countQuery, params);

    return {
      products,
      total: countResult[0].total
    };
  }



  async findById(id: number, branchId: number): Promise<ProductRow | null> {
    const [rows] = await pool.query<ProductRow[]>(
      'SELECT * FROM products WHERE id = ? AND branch_id = ?',
      [id, branchId]
    );

    return rows[0] || null;
  }

  async create(data: CreateProductDTO, branchId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO products (name, description, quantity, price, category_id, branch_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.description || null, data.quantity, data.price, data.category_id || null, branchId]
    );

    return result.insertId;
  }

  async update(id: number, data: UpdateProductDTO, branchId: number): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.price !== undefined) {
      fields.push('price = ?');
      values.push(data.price);
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(data.category_id);
    }

    if (fields.length === 0) return false;

    values.push(id, branchId);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND branch_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async delete(id: number, branchId: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM products WHERE id = ? AND branch_id = ?',
      [id, branchId]
    );

    return result.affectedRows > 0;
  }

  async search(query: string, branchId: number, limit: number = 10): Promise<{ id: number; name: string }[]> {
    const [rows] = await pool.query<SearchProductRow[]>(
      'SELECT id, name FROM products WHERE name LIKE ? AND branch_id = ? ORDER BY name LIMIT ?',
      [`%${query}%`, branchId, limit]
    );

    return rows;
  }
}