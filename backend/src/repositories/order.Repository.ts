import { pool } from '../db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Order, OrderItem, CreateOrderDTO, UpdateOrderDTO, PaginationParams } from '../types/types';

interface OrderRow extends RowDataPacket, Order { }
interface OrderItemRow extends RowDataPacket, OrderItem { }

export class OrderRepository {
    // Crear orden con transacción
    async create(data: CreateOrderDTO, branchId: number): Promise<number> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Insertar orden con branch_id
            const [orderResult] = await connection.query<ResultSetHeader>(
                'INSERT INTO orders (type, document_type, client_id, notes, total_amount, branch_id) VALUES (?, ?, ?, ?, ?, ?)',
                [data.type, data.document_type, data.client_id || null, data.notes || null, 0, branchId]
            );

            const orderId = orderResult.insertId;

            // 2. Insertar items y actualizar stock (solo si es remito y solo productos de la misma sucursal)
            let totalAmount = 0;

            const updateStock = data.document_type === 'remito';

            for (const item of data.items) {
                // Insertar item
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price]
                );

                totalAmount += item.quantity * item.price;

                // Actualizar stock solo si es remito Y solo productos de la misma sucursal
                if (updateStock) {
                    const stockChange = data.type === 'entry' ? item.quantity : -item.quantity;

                    await connection.query(
                        'UPDATE products SET quantity = quantity + ? WHERE id = ? AND branch_id = ?',
                        [stockChange, item.product_id, branchId]
                    );
                }
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
    async findByIdWithItems(id: number, branchId?: number): Promise<any> {
        // Si se pasa branchId, filtrar por él (para validar propiedad)
        const query = branchId 
            ? `SELECT o.*, c.name as client_name, b.name as branch_name, b.address as branch_address
               FROM orders o 
               LEFT JOIN clients c ON o.client_id = c.id
               LEFT JOIN branches b ON o.branch_id = b.id
               WHERE o.id = ? AND o.branch_id = ?`
            : `SELECT o.*, c.name as client_name, b.name as branch_name, b.address as branch_address
               FROM orders o 
               LEFT JOIN clients c ON o.client_id = c.id
               LEFT JOIN branches b ON o.branch_id = b.id
               WHERE o.id = ?`;

        const params = branchId ? [id, branchId] : [id];

        const [orders] = await pool.query<OrderRow[]>(query, params);

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

    // Listar órdenes - SIN filtro de branch (se ven globalmente)
    async findAll(
        pagination: PaginationParams,
        filters?: { type?: 'entry' | 'exit'; search?: string }
    ): Promise<{ orders: OrderRow[], total: number }> {
        const offset = (pagination.page - 1) * pagination.limit;

        // ← Construir WHERE dinámicamente según filtros
        const whereClauses: string[] = [];
        const params: any[] = [];

        if (filters?.type) {
            whereClauses.push('o.type = ?');
            params.push(filters.type);
        }

        if (filters?.search) {
            // ← Buscar por nombre de cliente o notas
            whereClauses.push('(c.name LIKE ? OR o.notes LIKE ?)');
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const whereSQL = whereClauses.length > 0
            ? `WHERE ${whereClauses.join(' AND ')}`
            : '';

        // ← Query para órdenes con filtros
        const ordersQuery = `
      SELECT 
        o.*,
        c.name as client_name,
        b.name as branch_name,
        b.address as branch_address
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      LEFT JOIN branches b ON o.branch_id = b.id
      ${whereSQL}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

        const [orders] = await pool.query<OrderRow[]>(
            ordersQuery,
            [...params, pagination.limit, offset]
        );

        // ← Query para contar total con los MISMOS filtros
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      ${whereSQL}
    `;

        const [countResult] = await pool.query<any[]>(countQuery, params);

        return {
            orders,
            total: countResult[0].total
        };
    }


    // Actualizar orden (solo client_id y notes) - verificar branch
    async update(id: number, data: UpdateOrderDTO, branchId: number): Promise<boolean> {
        // Primero verificar que la orden pertenece a esta sucursal
        const [orders] = await pool.query<OrderRow[]>(
            'SELECT id FROM orders WHERE id = ? AND branch_id = ?',
            [id, branchId]
        );

        if (orders.length === 0) return false;

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

    // Eliminar orden (con reversión de stock solo si es remito) - verificar branch
    async delete(id: number, branchId: number): Promise<void> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Obtener info de la orden (solo de esta sucursal)
            const [orders] = await connection.query<OrderRow[]>(
                'SELECT type, document_type FROM orders WHERE id = ? AND branch_id = ?',
                [id, branchId]
            );

            if (orders.length === 0) {
                throw new Error('Order not found');
            }

            const orderType = orders[0].type;
            const documentType = orders[0].document_type;

            // Obtener items
            const [items] = await connection.query<OrderItemRow[]>(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            // Revertir stock solo si es remito Y solo productos de la misma sucursal
            if (documentType === 'remito') {
                for (const item of items) {
                    const stockChange = orderType === 'entry' ? -item.quantity : item.quantity;
                    await connection.query(
                        'UPDATE products SET quantity = quantity + ? WHERE id = ? AND branch_id = ?',
                        [stockChange, item.product_id, branchId]
                    );
                }
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

    // Obtener estadísticas - SIN filtro de branch (global)
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