import { pool } from '../db/db';
import { CategoryRow, CreateCategoryDTO, UpdateCategoryDTO, PaginationParams } from '../types/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class CategoryRepository {

    async findAll(branchId: number): Promise<{ categories: CategoryRow[] }> {

        const [categories] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE branch_id = ? ORDER BY parent_id ASC, name ASC',
            [branchId]
        );

        return {
            categories,
        };
    }

    async findById(id: number, branchId: number): Promise<CategoryRow | null> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE id = ? AND branch_id = ?',
            [id, branchId]
        );

        return rows[0] || null;
    }

    async findByName(name: string, branchId: number): Promise<CategoryRow | null> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE name = ? AND branch_id = ?',
            [name, branchId]
        );

        return rows[0] || null;
    }

    async create(data: CreateCategoryDTO, branchId: number): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO categories (name, parent_id, branch_id) VALUES (?, ?, ?)',
            [data.name, data.parent_id || null, branchId]
        );

        return result.insertId;
    }

    async update(id: number, data: UpdateCategoryDTO, branchId: number): Promise<boolean> {
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

        values.push(id, branchId);

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND branch_id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    async delete(id: number, branchId: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM categories WHERE id = ? AND branch_id = ?',
            [id, branchId]
        );

        return result.affectedRows > 0;
    }

    // MÉTODOS ESPECÍFICOS PARA SUBCATEGORÍAS

    // Obtener solo categorías padre (parent_id = null)
    async findParentCategories(branchId: number): Promise<CategoryRow[]> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE parent_id IS NULL AND branch_id = ? ORDER BY name ASC',
            [branchId]
        );

        return rows;
    }

    // Obtener subcategorías de una categoría específica
    async findSubcategories(parentId: number, branchId: number): Promise<CategoryRow[]> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE parent_id = ? AND branch_id = ? ORDER BY name ASC',
            [parentId, branchId]
        );

        return rows;
    }

    // Obtener todas las categorías con estructura plana
    async findAllFlat(branchId: number): Promise<CategoryRow[]> {
        const [rows] = await pool.query<CategoryRow[]>(
            'SELECT * FROM categories WHERE branch_id = ? ORDER BY parent_id ASC, name ASC',
            [branchId]
        );

        return rows;
    }

    async getCategoryTree(categoryId: number, branchId: number): Promise<number[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `WITH RECURSIVE category_tree AS (
                SELECT id, parent_id, 0 AS level
                FROM categories WHERE id = ? AND branch_id = ?
                UNION ALL
                SELECT c.id, c.parent_id, ct.level + 1
                FROM categories c
                INNER JOIN category_tree ct ON c.parent_id = ct.id
                WHERE c.branch_id = ?
            )
            SELECT id FROM category_tree`,
            [categoryId, branchId, branchId]
        );

        return rows.map(row => row.id as number);
    }

    async updatePricesByCategory(categoryIds: number[], percentage: number, branchId: number): Promise<number> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.query<ResultSetHeader>(
                `UPDATE products
                 SET price = ROUND(price * (1 + ? / 100.0), 2)
                 WHERE category_id IN (?) AND branch_id = ?`,
                [percentage, categoryIds, branchId]
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

    async getProductsByCategories(categoryIds: number[], branchId: number): Promise<RowDataPacket[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, name, price FROM products WHERE category_id IN (?) AND branch_id = ? ORDER BY name',
            [categoryIds, branchId]
        );
        return rows;
    }

}