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
        filters?: { search?: string },
        sort?: { field: string; order: 'ASC' | 'DESC' }
    ): Promise<PaginatedResult<Client>> {
        const { clients, total } = await this.repository.findAll(pagination, filters, sort);

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

    async getById(id: number): Promise<Client> {
        const client = await this.repository.findById(id);

        if (!client) {
            throw new NotFoundError('Client', id);
        }

        return client;
    }

    async create(data: CreateClientDTO): Promise<Client> {
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

        // Validación: CUIL único
        const existing = await this.repository.findByCuil(data.cuil);
        if (existing) {
            throw new DuplicateError('Cliente', 'CUIL', data.cuil);
        }

        // Validación de email si existe
        if (data.email && !this.isValidEmail(data.email)) {
            throw new ValidationError('Invalid email format');
        }

        const id = await this.repository.create(data);
        return this.getById(id);
    }

    async update(id: number, data: UpdateClientDTO): Promise<Client> {
        // Verificar que existe
        await this.getById(id);

        // Validar CUIL único si se actualiza
        if (data.cuil) {
            const existing = await this.repository.findByCuil(data.cuil);
            if (existing && existing.id !== id) {
                throw new DuplicateError('Cliente', 'CUIL', data.cuil);
            }
        }

        // Validación de email si existe
        if (data.email && !this.isValidEmail(data.email)) {
            throw new ValidationError('Invalid email format');
        }

        const updated = await this.repository.update(id, data);

        if (!updated) {
            throw new ValidationError('No changes were made');
        }

        return this.getById(id);
    }

    async delete(id: number): Promise<void> {
        // Verificar que existe
        await this.getById(id);

        const deleted = await this.repository.delete(id);

        if (!deleted) {
            throw new ValidationError('Failed to delete client');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}