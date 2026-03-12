import { pool } from '../db/db';
import { Product, PaginationParams, CreateProductDTO, UpdateProductDTO } from '../types/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface ProductRow extends RowDataPacket, Product { }

export class ProductRepository {
  // ← ACTUALIZAR: Agregar parámetros de búsqueda y filtro
  async findAll(
    pagination: PaginationParams,
    filters?: { search?: string; category_id?: number }
  ): Promise<{ products: ProductRow[], total: number }> {
    const offset = (pagination.page - 1) * pagination.limit;

    // ← Construir WHERE dinámicamente según filtros
    const whereClauses: string[] = [];
    const params: any[] = [];

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

    // ← Query para productos con filtros
    const productsQuery = `
      SELECT * FROM products 
      ${whereSQL}
      ORDER BY id DESC 
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

  // ... resto de métodos sin cambios


  async findById(id: number): Promise<ProductRow | null> {
    const [rows] = await pool.query<ProductRow[]>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    return rows[0] || null;
  }

  async create(data: CreateProductDTO): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO products (name, description, quantity, price, category_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.description || null, data.quantity, data.price, data.category_id || null]
    );

    return result.insertId;
  }

  async update(id: number, data: UpdateProductDTO): Promise<boolean> {
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

    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }
}