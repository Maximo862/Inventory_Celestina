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

    async getAll(branchId: number): Promise<{data : CategoryRow[]}> {
        const { categories } = await this.repository.findAll(branchId);

        return {
            data: categories,
        };
    }

    async getById(id: number, branchId: number): Promise<Category> {
        const category = await this.repository.findById(id, branchId);

        if (!category) {
            throw new NotFoundError('Category', id);
        }

        return category;
    }

    async create(data: CreateCategoryDTO, branchId: number): Promise<Category> {
        // Validación: nombre requerido
        if (!data.name || data.name.trim() === '') {
            throw new ValidationError('Category name is required');
        }

        // Validación: nombre único por sucursal
        const existing = await this.repository.findByName(data.name, branchId);
        if (existing) {
            throw new DuplicateError('Categoria', 'nombre', data.name);
        }

        // Validación: si tiene parent_id, verificar que exista (de la misma sucursal)
        if (data.parent_id) {
            const parent = await this.repository.findById(data.parent_id, branchId);
            if (!parent) {
                throw new NotFoundError('Parent category', data.parent_id);
            }
        }

        const id = await this.repository.create(data, branchId);
        return this.getById(id, branchId);
    }

    async update(id: number, data: UpdateCategoryDTO, branchId: number): Promise<Category> {
        // Verificar que existe y pertenece a la sucursal
        await this.getById(id, branchId);

        // Validación: si se actualiza el nombre, debe ser único por sucursal
        if (data.name) {
            const existing = await this.repository.findByName(data.name, branchId);
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
                const parent = await this.repository.findById(data.parent_id, branchId);
                if (!parent) {
                    throw new NotFoundError('Parent category', data.parent_id);
                }
            }
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
            throw new ValidationError('Failed to delete category');
        }
    }

    async getParentCategories(branchId: number): Promise<Category[]> {
        return this.repository.findParentCategories(branchId);
    }

    async getSubcategories(parentId: number, branchId: number): Promise<Category[]> {
        // Verificar que el padre existe
        await this.getById(parentId, branchId);
        return this.repository.findSubcategories(parentId, branchId);
    }

    async updatePrices(id: number, data: UpdateCategoryPricesDTO, branchId: number): Promise<PriceUpdateResult> {
        await this.getById(id, branchId);

        if (data.percentage === 0) {
            throw new ValidationError('Percentage cannot be zero');
        }

        if (data.percentage < -100 || data.percentage > 1000) {
            throw new ValidationError('Percentage must be between -100 and 1000');
        }

        const categoryIds = await this.repository.getCategoryTree(id, branchId);
        const affectedProducts = await this.repository.updatePricesByCategory(categoryIds, data.percentage, branchId);

        return {
            affectedProducts,
            categoryId: id,
            percentage: data.percentage,
        };
    }

    async previewPrices(id: number, data: UpdateCategoryPricesDTO, branchId: number): Promise<PricePreviewResult> {
        await this.getById(id, branchId);

        if (data.percentage === 0) {
            throw new ValidationError('Percentage cannot be zero');
        }

        if (data.percentage < -100 || data.percentage > 1000) {
            throw new ValidationError('Percentage must be between -100 and 1000');
        }

        const categoryIds = await this.repository.getCategoryTree(id, branchId);
        const products = await this.repository.getProductsByCategories(categoryIds, branchId);

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