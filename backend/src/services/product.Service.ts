import { ProductRepository } from '../repositories/product.Repository';
import { CategoryRepository } from '../repositories/category.Repository';
import { ValidationError, NotFoundError } from '../utils/appError';
import { CreateProductDTO, UpdateProductDTO, PaginationParams, PaginatedResult, Product, SortParams } from '../types/types';

export class ProductService {
    private repository: ProductRepository;
    private categoryRepository: CategoryRepository;

    constructor() {
        this.repository = new ProductRepository();
        this.categoryRepository = new CategoryRepository();
    }

    async getAll(
        pagination: PaginationParams,
        branchId: number,
        filters?: { search?: string; category_id?: number },
        sortParams?: SortParams
    ): Promise<PaginatedResult<Product>> {
        const { products, total } = await this.repository.findAll(pagination, branchId, filters, sortParams);
        return {
            data: products,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit)
            }
        };
    }

    async getById(id: number, branchId: number): Promise<Product> {
        const product = await this.repository.findById(id, branchId);

        if (!product) {
            throw new NotFoundError('Product', id);
        }

        return product;
    }

    async create(data: CreateProductDTO, branchId: number): Promise<Product> {
        // Validaciones
        if (!data.name || data.name.trim() === '') {
            throw new ValidationError('Product name is required');
        }

        if (data.quantity < 0) {
            throw new ValidationError('Quantity cannot be negative');
        }

        if (data.price <= 0) {
            throw new ValidationError('Price must be greater than zero');
        }

        // Validar categoría si existe (de la misma sucursal)
        if (data.category_id) {
            const category = await this.categoryRepository.findById(data.category_id, branchId);
            if (!category) {
                throw new NotFoundError('Category', data.category_id);
            }
        }

        const id = await this.repository.create(data, branchId);
        return this.getById(id, branchId);
    }

    async update(id: number, data: UpdateProductDTO, branchId: number): Promise<Product> {
        // Verificar que existe y pertenece a la sucursal
        await this.getById(id, branchId);

        if (data.price !== undefined && data.price <= 0) {
            throw new ValidationError('Price must be greater than zero');
        }

        // Validar categoría si se actualiza (de la misma sucursal)
        if (data.category_id) {
            const category = await this.categoryRepository.findById(data.category_id, branchId);
            if (!category) {
                throw new NotFoundError('Category', data.category_id);
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
            throw new ValidationError('Failed to delete product');
        }
    }

    async search(query: string, branchId: number, limit: number = 10): Promise<{ id: number; name: string }[]> {
        if (!query || query.trim() === '') {
            return [];
        }

        return this.repository.search(query.trim(), branchId, limit);
    }
}