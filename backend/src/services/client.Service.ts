import { ClientRepository } from '../repositories/client.Repository';
import { ValidationError, NotFoundError, DuplicateError } from '../utils/appError';
import { CreateClientDTO, UpdateClientDTO, PaginationParams, PaginatedResult, Client } from '../types/types';

export class ClientService {
    private repository: ClientRepository;

    constructor() {
        this.repository = new ClientRepository();
    }

    async getAll(
        pagination: PaginationParams,
        branchId: number,
        filters?: { search?: string },
        sort?: { field: string; order: 'ASC' | 'DESC' }
    ): Promise<PaginatedResult<Client>> {
        const { clients, total } = await this.repository.findAll(pagination, branchId, filters, sort);

        return {
            data: clients,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit)
            }
        };
    }

    async getById(id: number, branchId: number): Promise<Client> {
        const client = await this.repository.findById(id, branchId);

        if (!client) {
            throw new NotFoundError('Client', id);
        }

        return client;
    }

    async create(data: CreateClientDTO, branchId: number): Promise<Client> {
        // Validaciones
        if (!data.name || data.name.trim() === '') {
            throw new ValidationError('Client name is required');
        }

        if (!data.cuil || data.cuil.trim() === '') {
            throw new ValidationError('CUIL is required');
        }

        if (!data.tax_condition || data.tax_condition.trim() === '') {
            throw new ValidationError('Tax condition is required');
        }

        // Validación: CUIL único por sucursal
        const existing = await this.repository.findByCuil(data.cuil, branchId);
        if (existing) {
            throw new DuplicateError('Cliente', 'CUIL', data.cuil);
        }

        // Validación de email si existe
        if (data.email && !this.isValidEmail(data.email)) {
            throw new ValidationError('Invalid email format');
        }

        const id = await this.repository.create(data, branchId);
        return this.getById(id, branchId);
    }

    async update(id: number, data: UpdateClientDTO, branchId: number): Promise<Client> {
        // Verificar que existe y pertenece a la sucursal
        await this.getById(id, branchId);

        // Validar CUIL único si se actualiza (por sucursal)
        if (data.cuil) {
            const existing = await this.repository.findByCuil(data.cuil, branchId);
            if (existing && existing.id !== id) {
                throw new DuplicateError('Cliente', 'CUIL', data.cuil);
            }
        }

        // Validación de email si existe
        if (data.email && !this.isValidEmail(data.email)) {
            throw new ValidationError('Invalid email format');
        }

        const updated = await this.repository.update(id, data, branchId);

        if (!updated) {
            throw new ValidationError('No changes were made');
        }

        return this.getById(id, branchId);
    }

    async delete(id: number, branchId: number): Promise<void> {
        // Verificar que existe y pertenece a la sucursal
        await this.getById(id, branchId);

        const deleted = await this.repository.delete(id, branchId);

        if (!deleted) {
            throw new ValidationError('Failed to delete client');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async search(query: string, branchId: number, limit: number = 10): Promise<{ id: number; name: string }[]> {
        if (!query || query.trim() === '') {
            return [];
        }

        return this.repository.search(query.trim(), branchId, limit);
    }
}