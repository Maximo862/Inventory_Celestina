import { pool } from '../db/db';
import { CategoryRow, CreateCategoryDTO, UpdateCategoryDTO, PaginationParams } from '../types/types';
import { ResultSetHeader } from 'mysql2/promise';

export class CategoryRepository {
    async findAll(pagination: PaginationParams): Promise<{ categories: CategoryRow[], total: number }> {
        const offset = (pagination.page - 1) * pagination.limit;

        const [categories] = await pool.query<CategoryRow[]>(
            'SELECT name, id FROM categories ORDER BY id DESC LIMIT ? OFFSET ?',
            [pagination.limit, offset]
        );

        const [countResult] = await pool.query<any[]>(
            'SELECT COUNT(*) as total FROM categories'
        );

        return {
            categories,
            total: countResult[0].total
        };
    }

    async findById(id: number): Promise<CategoryRow | null> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT name, id  FROM categories WHERE id = ?',
            [id]
        );

        return rows[0] || null;
    }

    async findByName(name: string): Promise<CategoryRow | null> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT name, id  FROM categories WHERE name = ?',
            [name]
        );

        return rows[0] || null;
    }

    async create(data: CreateCategoryDTO): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO categories (name) VALUES (?)',
            [data.name]
        );

        return result.insertId;
    }

    async update(id: number, data: UpdateCategoryDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }

        if (fields.length === 0) return false;

        values.push(id);

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM categories WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }
}