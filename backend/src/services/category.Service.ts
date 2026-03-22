import { CategoryRepository } from '../repositories/category.Repository';
import { ValidationError, NotFoundError, DuplicateError, AppError } from '../utils/appError';
import {
    CreateCategoryDTO,
    UpdateCategoryDTO,
    Category,
    CategoryRow,
    UpdateCategoryPricesDTO,
    PriceUpdateResult,
    PricePreviewResult
} from '../types/types';

export class CategoryService {
    private repository: CategoryRepository;

    constructor() {
        this.repository = new CategoryRepository();
    }

    async getAll(): Promise<{data : CategoryRow[]}> {
        const { categories } = await this.repository.findAll();

        return {
            data: categories,
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
            throw new DuplicateError('Categoria', 'nombre', data.name);
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

    async updatePrices(id: number, data: UpdateCategoryPricesDTO): Promise<PriceUpdateResult> {
        await this.getById(id);

        if (data.percentage === 0) {
            throw new ValidationError('Percentage cannot be zero');
        }

        if (data.percentage < -100 || data.percentage > 1000) {
            throw new ValidationError('Percentage must be between -100 and 1000');
        }

        const categoryIds = await this.repository.getCategoryTree(id);
        const affectedProducts = await this.repository.updatePricesByCategory(categoryIds, data.percentage);

        return {
            affectedProducts,
            categoryId: id,
            percentage: data.percentage,
        };
    }

    async previewPrices(id: number, data: UpdateCategoryPricesDTO): Promise<PricePreviewResult> {
        await this.getById(id);

        if (data.percentage === 0) {
            throw new ValidationError('Percentage cannot be zero');
        }

        if (data.percentage < -100 || data.percentage > 1000) {
            throw new ValidationError('Percentage must be between -100 and 1000');
        }

        const categoryIds = await this.repository.getCategoryTree(id);
        const products = await this.repository.getProductsByCategories(categoryIds);

        const productsWithNewPrice = products.map(product => {
            const currentPrice = Number(product.price);
            const newPrice = Math.round(currentPrice * (1 + data.percentage / 100) * 100) / 100;
            return {
                id: product.id as number,
                name: product.name as string,
                currentPrice,
                newPrice,
            };
        });

        const totalCurrentPrice = productsWithNewPrice.reduce((sum, p) => sum + p.currentPrice, 0);
        const totalNewPrice = productsWithNewPrice.reduce((sum, p) => sum + p.newPrice, 0);

        return {
            categoryId: id,
            categoryIds,
            percentage: data.percentage,
            affectedProducts: productsWithNewPrice,
            totalCurrentPrice: Math.round(totalCurrentPrice * 100) / 100,
            totalNewPrice: Math.round(totalNewPrice * 100) / 100,
        };
    }
}