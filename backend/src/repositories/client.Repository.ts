import { pool } from '../db/db';
import { ClientRow, CreateClientDTO, UpdateClientDTO, PaginationParams } from '../types/types';
import { ResultSetHeader } from 'mysql2/promise';

export class ClientRepository {
    async findAll(pagination: PaginationParams): Promise<{ clients: ClientRow[], total: number }> {
        const offset = (pagination.page - 1) * pagination.limit;

        const [clients] = await pool.query<ClientRow[]>(
            'SELECT * FROM clients ORDER BY id DESC LIMIT ? OFFSET ?',
            [pagination.limit, offset]
        );

        const [countResult] = await pool.query<any[]>(
            'SELECT COUNT(*) as total FROM clients'
        );

        return {
            clients,
            total: countResult[0].total
        };
    }

    async findById(id: number): Promise<ClientRow | null> {
        const [rows] = await pool.query<ClientRow[]>(
            'SELECT * FROM clients WHERE id = ?',
            [id]
        );

        return rows[0] || null;
    }

    async findByCuil(cuil: string): Promise<ClientRow | null> {
        const [rows] = await pool.query<ClientRow[]>(
            'SELECT * FROM clients WHERE cuil = ?',
            [cuil]
        );

        return rows[0] || null;
    }

    async create(data: CreateClientDTO): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO clients (name, phone, email, address, cuil, tax_condition) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.phone || null,
                data.email || null,
                data.address || null,
                data.cuil,
                data.tax_condition
            ]
        );

        return result.insertId;
    }

    async update(id: number, data: UpdateClientDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.phone !== undefined) {
            fields.push('phone = ?');
            values.push(data.phone);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            values.push(data.email);
        }
        if (data.address !== undefined) {
            fields.push('address = ?');
            values.push(data.address);
        }
        if (data.cuil !== undefined) {
            fields.push('cuil = ?');
            values.push(data.cuil);
        }
        if (data.tax_condition !== undefined) {
            fields.push('tax_condition = ?');
            values.push(data.tax_condition);
        }

        if (fields.length === 0) return false;

        values.push(id);

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM clients WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }
}