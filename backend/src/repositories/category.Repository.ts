import { pool } from '../db/db';
import { CategoryRow, CreateCategoryDTO, UpdateCategoryDTO, PaginationParams } from '../types/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class CategoryRepository {

    async findAll(): Promise<{ categories: CategoryRow[] }> {

        const [categories] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories ORDER BY parent_id ASC, name ASC',
        );

        return {
            categories,
        };
    }

    async findById(id: number): Promise<CategoryRow | null> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE id = ?',
            [id]
        );

        return rows[0] || null;
    }

    async findByName(name: string): Promise<CategoryRow | null> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE name = ?',
            [name]
        );

        return rows[0] || null;
    }

    async create(data: CreateCategoryDTO): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO categories (name, parent_id) VALUES (?, ?)',
            [data.name, data.parent_id || null]
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

        if (data.parent_id !== undefined) {
            fields.push('parent_id = ?');
            values.push(data.parent_id);
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

    // MÉTODOS ESPECÍFICOS PARA SUBCATEGORÍAS

    // Obtener solo categorías padre (parent_id = null)
    async findParentCategories(): Promise<CategoryRow[]> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name ASC'
        );

        return rows;
    }

    // Obtener subcategorías de una categoría específica
    async findSubcategories(parentId: number): Promise<CategoryRow[]> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE parent_id = ? ORDER BY name ASC',
            [parentId]
        );

        return rows;
    }

    // Obtener todas las categorías con estructura plana
    async findAllFlat(): Promise<CategoryRow[]> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories ORDER BY parent_id ASC, name ASC'
        );

        return rows;
    }

    async getCategoryTree(categoryId: number): Promise<number[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `WITH RECURSIVE category_tree AS (
                SELECT id, parent_id, 0 AS level
                FROM categories WHERE id = ?
                UNION ALL
                SELECT c.id, c.parent_id, ct.level + 1
                FROM categories c
                INNER JOIN category_tree ct ON c.parent_id = ct.id
            )
            SELECT id FROM category_tree`,
            [categoryId]
        );

        return rows.map(row => row.id as number);
    }

    async updatePricesByCategory(categoryIds: number[], percentage: number): Promise<number> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.query<ResultSetHeader>(
                `UPDATE products
                 SET price = ROUND(price * (1 + ? / 100.0), 2)
                 WHERE category_id IN (?)`,
                [percentage, categoryIds]
            );

            await connection.commit();
            return result.affectedRows;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    async getProductsByCategories(categoryIds: number[]): Promise<RowDataPacket[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, name, price FROM products WHERE category_id IN (?) ORDER BY name',
            [categoryIds]
        );
        return rows;
    }

}