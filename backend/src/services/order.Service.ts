import { OrderRepository } from '../repositories/order.Repository';
import { ProductRepository } from '../repositories/product.Repository';
import { ValidationError, NotFoundError, InsufficientStockError } from '../utils/appError';
import type { CreateOrderDTO, UpdateOrderDTO, PaginatedResult, Order, PaginationParams } from '../types/types';

export class OrderService {
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.productRepo = new ProductRepository();
  }

  async create(data: CreateOrderDTO, branchId: number) {
    // Validaciones
    if (!data.type || (data.type !== 'entry' && data.type !== 'exit')) {
      throw new ValidationError('Order type must be "entry" or "exit"');
    }

    if (!data.document_type || (data.document_type !== 'proforma' && data.document_type !== 'remito')) {
      throw new ValidationError('Document type must be "proforma" or "remito"');
    }

    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Order must have at least one item');
    }

    // Validar que todos los items tengan datos válidos
    for (const item of data.items) {
      if (!item.product_id || item.quantity <= 0 || item.price <= 0) {
        throw new ValidationError('All items must have valid product_id, quantity and price');
      }
    }

    // Si es salida, validar stock (solo productos de la misma sucursal)
    if (data.type === 'exit' && data.document_type === "remito") {
      const productTotals: Record<number, number> = {};

      for (const item of data.items) {
        if (!productTotals[item.product_id]) {
          productTotals[item.product_id] = 0;
        }
        productTotals[item.product_id] += item.quantity;
      }

      if (data.type === 'exit' && data.document_type === 'remito') {
        for (const idProduct in productTotals) {
          const productId = Number(idProduct)
          // Buscar solo productos de la misma sucursal
          const product = await this.productRepo.findById(productId, branchId);

          if (!product) {
            throw new NotFoundError('Product', productId);
          }

          if (product.quantity < productTotals[productId]) {
            throw new InsufficientStockError(
              product.name,
              product.quantity,
              productTotals[productId]
            );
          }
        }
      }
    }

    // Si es entrada, verificar que los productos existan (de la misma sucursal)
    if (data.type === 'entry') {
      for (const item of data.items) {
        const product = await this.productRepo.findById(item.product_id, branchId);
        if (!product) {
          throw new NotFoundError('Product', item.product_id);
        }
      }
    }

    // Crear orden con branchId
    const orderId = await this.orderRepo.create(data, branchId);
    // Para findByIdWithItems no filtramos por branch para poder ver la orden
    return this.orderRepo.findByIdWithItems(orderId);
  }

  async getById(id: number, branchId: number) {
    // Verificar que la orden pertenece a la sucursal
    const order = await this.orderRepo.findByIdWithItems(id, branchId);

    if (!order) {
      throw new NotFoundError('Order', id);
    }

    return order;
  }

  async getAll(
    pagination: PaginationParams,
    filters?: { type?: 'entry' | 'exit'; search?: string }
  ): Promise<PaginatedResult<Order>> {
    // Sin filtro de branch - se ven todas las órdenes globalmente
    const { orders, total } = await this.orderRepo.findAll(pagination, filters);

    return {
      data: orders,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  }

  async update(id: number, data: UpdateOrderDTO, branchId: number) {
    // Verificar que existe y pertenece a la sucursal
    await this.getById(id, branchId);

    const updated = await this.orderRepo.update(id, data, branchId);

    if (!updated) {
      throw new ValidationError('No changes were made');
    }

    return this.getById(id, branchId);
  }

  async delete(id: number, branchId: number) {
    // Verificar que existe y pertenece a la sucursal
    await this.getById(id, branchId);

    await this.orderRepo.delete(id, branchId);
  }

  async getStats() {
    // Stats globales (sin filtro de branch)
    return this.orderRepo.getStats();
  }
}