import { ProductRepository } from '../repositories/product.Repository';
import { CategoryRepository } from '../repositories/category.Repository';
import { CreateProductDTO, UpdateProductDTO, PaginationParams, PaginatedResult, Product } from '../types/types';

export class ProductService {
    private repository: ProductRepository;
    private categoryRepository: CategoryRepository;

    constructor() {
        this.repository = new ProductRepository();
        this.categoryRepository = new CategoryRepository();
    }

    async getAll(pagination: PaginationParams): Promise<PaginatedResult<Product>> {
        const { products, total } = await this.repository.findAll(pagination);

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

    async getById(id: number): Promise<Product> {
        const product = await this.repository.findById(id);

        if (!product) {
            throw new Error(`Product with id ${id} not found`);
        }

        return product;
    }

    async create(data: CreateProductDTO): Promise<Product> {
        // Validaciones
        if (!data.name || data.name.trim() === '') {
            throw new Error('Product name is required');
        }

        if (data.quantity < 0) {
            throw new Error('Quantity cannot be negative');
        }

        if (data.price <= 0) {
            throw new Error('Price must be greater than zero');
        }

        // Validar categoría si existe
        if (data.category_id) {
            const category = await this.categoryRepository.findById(data.category_id);
            if (!category) {
                throw new Error(`Category with id ${data.category_id} not found`);
            }
        }

        const id = await this.repository.create(data);
        return this.getById(id);
    }

    async update(id: number, data: UpdateProductDTO): Promise<Product> {
        // Verificar que existe
        await this.getById(id);

        // Validaciones
        if (data.quantity !== undefined && data.quantity < 0) {
            throw new Error('Quantity cannot be negative');
        }

        if (data.price !== undefined && data.price <= 0) {
            throw new Error('Price must be greater than zero');
        }

        // Validar categoría si se actualiza
        if (data.category_id) {
            const category = await this.categoryRepository.findById(data.category_id);
            if (!category) {
                throw new Error(`Category with id ${data.category_id} not found`);
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
            throw new Error(`Failed to delete product with id ${id}`);
        }
    }
}