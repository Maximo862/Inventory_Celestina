import { ClientRepository } from '../repositories/client.Repository';
import { CreateClientDTO, UpdateClientDTO, PaginationParams, PaginatedResult, Client } from '../types/types';

export class ClientService {
    private repository: ClientRepository;

    constructor() {
        this.repository = new ClientRepository();
    }

    async getAll(pagination: PaginationParams): Promise<PaginatedResult<Client>> {
        const { clients, total } = await this.repository.findAll(pagination);

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
            throw new Error(`Client with id ${id} not found`);
        }

        return client;
    }

    async create(data: CreateClientDTO): Promise<Client> {
        // Validaciones
        if (!data.name || data.name.trim() === '') {
            throw new Error('Client name is required');
        }

        if (!data.cuil || data.cuil.trim() === '') {
            throw new Error('CUIL is required');
        }

        if (!data.tax_condition || data.tax_condition.trim() === '') {
            throw new Error('Tax condition is required');
        }

        // Validación: CUIL único
        const existing = await this.repository.findByCuil(data.cuil);
        if (existing) {
            throw new Error(`Client with CUIL '${data.cuil}' already exists`);
        }

        // Validación de email si existe
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error('Invalid email format');
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
                throw new Error(`Client with CUIL '${data.cuil}' already exists`);
            }
        }

        // Validación de email si existe
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error('Invalid email format');
        }

        const updated = await this.repository.update(id, data);

        if (!updated) {
            throw new Error('No changes were made');
        }

        return this.getById(id);
    }

    async delete(id: number): Promise<void> {
        // Verificar que existe
        await this.getById(id);

        const deleted = await this.repository.delete(id);

        if (!deleted) {
            throw new Error(`Failed to delete client with id ${id}`);
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}