import { pool } from '../db/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Branch {
  id: number;
  name: string;
  address: string | null;
  created_at: Date;
}

interface BranchRow extends RowDataPacket, Branch {}

export async function findAllBranches(): Promise<Branch[]> {
  const [rows] = await pool.query<BranchRow[]>(
    'SELECT * FROM branches ORDER BY name ASC'
  );
  return rows;
}

export async function findBranchById(id: number): Promise<Branch | null> {
  const [rows] = await pool.query<BranchRow[]>(
    'SELECT * FROM branches WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}