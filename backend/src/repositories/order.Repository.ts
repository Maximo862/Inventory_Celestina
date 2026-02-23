import { pool } from '../db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Order, OrderItem, CreateOrderDTO, UpdateOrderDTO } from '../types/types';

interface OrderRow extends RowDataPacket, Order { }
interface OrderItemRow extends RowDataPacket, OrderItem { }

export class OrderRepository {
    // Crear orden con transacción
    async create(data: CreateOrderDTO): Promise<number> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Insertar orden
            const [orderResult] = await connection.query<ResultSetHeader>(
                'INSERT INTO orders (type, client_id, notes, total_amount) VALUES (?, ?, ?, ?)',
                [data.type, data.client_id || null, data.notes || null, 0]
            );

            const orderId = orderResult.insertId;

            // 2. Insertar items y actualizar stock
            let totalAmount = 0;

            for (const item of data.items) {
                // Insertar item
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price]
                );

                totalAmount += item.quantity * item.price;

                // Actualizar stock según tipo
                const stockChange = data.type === 'entry' ? item.quantity : -item.quantity;

                await connection.query(
                    'UPDATE products SET quantity = quantity + ? WHERE id = ?',
                    [stockChange, item.product_id]
                );
            }

            // 3. Actualizar total_amount
            await connection.query(
                'UPDATE orders SET total_amount = ? WHERE id = ?',
                [totalAmount, orderId]
            );

            await connection.commit();
            return orderId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener orden con items y detalles
    async findByIdWithItems(id: number): Promise<any> {
        const [orders] = await pool.query<OrderRow[]>(
            `SELECT o.*, c.name as client_name 
             FROM orders o 
             LEFT JOIN clients c ON o.client_id = c.id 
             WHERE o.id = ?`,
            [id]
        );

        if (orders.length === 0) return null;

        const [items] = await pool.query<OrderItemRow[]>(
            `SELECT oi.*, p.name as product_name 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [id]
        );

        return {
            ...orders[0],
            items
        };
    }

    // Listar órdenes con paginación y filtro
    async findAll(page: number, limit: number, type?: 'entry' | 'exit') {
        const offset = (page - 1) * limit;

        let query = `
            SELECT o.*, c.name as client_name 
            FROM orders o 
            LEFT JOIN clients c ON o.client_id = c.id
        `;

        const params: any[] = [];

        if (type) {
            query += ' WHERE o.type = ?';
            params.push(type);
        }

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [orders] = await pool.query<OrderRow[]>(query, params);

        let countQuery = 'SELECT COUNT(*) as total FROM orders';
        if (type) {
            countQuery += ' WHERE type = ?';
        }

        const [countResult] = await pool.query<any[]>(
            countQuery,
            type ? [type] : []
        );

        return {
            orders,
            total: countResult[0].total
        };
    }

    // Actualizar orden (solo client_id y notes)
    async update(id: number, data: UpdateOrderDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.client_id !== undefined) {
            fields.push('client_id = ?');
            values.push(data.client_id);
        }

        if (data.notes !== undefined) {
            fields.push('notes = ?');
            values.push(data.notes);
        }

        if (fields.length === 0) return false;

        values.push(id);

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Eliminar orden (con reversión de stock)
    async delete(id: number): Promise<void> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Obtener info de la orden
            const [orders] = await connection.query<OrderRow[]>(
                'SELECT type FROM orders WHERE id = ?',
                [id]
            );

            if (orders.length === 0) {
                throw new Error('Order not found');
            }

            const orderType = orders[0].type;

            // Obtener items
            const [items] = await connection.query<OrderItemRow[]>(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            // Revertir stock
            for (const item of items) {
                const stockChange = orderType === 'entry' ? -item.quantity : item.quantity;
                await connection.query(
                    'UPDATE products SET quantity = quantity + ? WHERE id = ?',
                    [stockChange, item.product_id]
                );
            }

            // Eliminar orden (cascade eliminará items)
            await connection.query('DELETE FROM orders WHERE id = ?', [id]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener estadísticas
    async getStats() {
        const [stats] = await pool.query<any[]>(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN type = 'entry' THEN 1 ELSE 0 END) as total_entries,
                SUM(CASE WHEN type = 'exit' THEN 1 ELSE 0 END) as total_exits,
                SUM(CASE WHEN type = 'entry' THEN total_amount ELSE 0 END) as total_entries_amount,
                SUM(CASE WHEN type = 'exit' THEN total_amount ELSE 0 END) as total_exits_amount
            FROM orders
        `);

        return stats[0];
    }
}