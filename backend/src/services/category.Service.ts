import { CategoryRepository } from '../repositories/category.Repository';
import { ValidationError, NotFoundError, DuplicateError, AppError } from '../utils/appError';
import {
    CreateCategoryDTO,
    UpdateCategoryDTO,
    PaginationParams,
    PaginatedResult,
    Category
} from '../types/types';

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
            throw new NotFoundError('Category', id);
        }

        return category;
    }

    async create(data: CreateCategoryDTO): Promise<Category> {
        // Validación: nombre requerido
        if (!data.name || data.name.trim() === '') {
            throw new ValidationError('Category name is required');
        }

        // Validación: nombre único
        const existing = await this.repository.findByName(data.name);
        if (existing) {
            throw new DuplicateError('Category', 'name', data.name);
        }

        // Validación: si tiene parent_id, verificar que exista
        if (data.parent_id) {
            const parent = await this.repository.findById(data.parent_id);
            if (!parent) {
                throw new NotFoundError('Parent category', data.parent_id);
            }
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
                throw new DuplicateError('Category', 'name', data.name);
            }
        }

        // Validación: si se actualiza parent_id
        if (data.parent_id !== undefined) {
            if (data.parent_id === id) {
                throw new AppError('Category cannot be its own parent', 400, 'SELF_REFERENCE');
            }

            if (data.parent_id !== null) {
                const parent = await this.repository.findById(data.parent_id);
                if (!parent) {
                    throw new NotFoundError('Parent category', data.parent_id);
                }
            }
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
            throw new ValidationError('Failed to delete category');
        }
    }

    async getParentCategories(): Promise<Category[]> {
        return this.repository.findParentCategories();
    }

    async getSubcategories(parentId: number): Promise<Category[]> {
        // Verificar que el padre existe
        await this.getById(parentId);
        return this.repository.findSubcategories(parentId);
    }
}