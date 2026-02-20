import { pool } from '../db/db';
import { ProductRow, CreateProductDTO, UpdateProductDTO, PaginationParams } from '../types/types';
import { ResultSetHeader } from 'mysql2/promise';

export class ProductRepository {
  async findAll(pagination: PaginationParams): Promise<{ products: ProductRow[], total: number }> {
    const offset = (pagination.page - 1) * pagination.limit;

    const [products] = await pool.query<ProductRow[]>(
      'SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?',
      [pagination.limit, offset]
    );

    const [countResult] = await pool.query<any[]>(
      'SELECT COUNT(*) as total FROM products'
    );

    return {
      products,
      total: countResult[0].total
    };
  }

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
    if (data.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(data.quantity);
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