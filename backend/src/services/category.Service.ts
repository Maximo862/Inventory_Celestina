import { CategoryRepository } from '../repositories/category.Repository';
import { CreateCategoryDTO, UpdateCategoryDTO, PaginationParams, PaginatedResult, Category } from '../types/types';

export class CategoryService {
    private repository: CategoryRepository;

    constructor() {
        this.repository = new CategoryRepository();
    }

    async getAll(pagination: PaginationParams): Promise<PaginatedResult<Category>> {
        const { categories, total } = await this.repository.findAll(pagination);

        return {
            data: categories,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit)
            }
        };
    }

    async getById(id: number): Promise<Category> {
        const category = await this.repository.findById(id);

        if (!category) {
            throw new Error(`Category with id ${id} not found`);
        }

        return category;
    }

    async create(data: CreateCategoryDTO): Promise<Category> {
        // Validación: nombre requerido
        if (!data.name || data.name.trim() === '') {
            throw new Error('Category name is required');
        }

        // Validación: nombre único
        const existing = await this.repository.findByName(data.name);
        if (existing) {
            throw new Error(`Category with name '${data.name}' already exists`);
        }

        const id = await this.repository.create(data);
        return this.getById(id);
    }

    async update(id: number, data: UpdateCategoryDTO): Promise<Category> {
        // Verificar que existe
        await this.getById(id);

        // Validación: si se actualiza el nombre, debe ser único
        if (data.name) {
            const existing = await this.repository.findByName(data.name);
            if (existing && existing.id !== id) {
                throw new Error(`Category with name '${data.name}' already exists`);
            }
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
            throw new Error(`Failed to delete category with id ${id}`);
        }
    }
}