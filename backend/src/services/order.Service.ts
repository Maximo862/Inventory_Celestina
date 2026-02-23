import { OrderRepository } from '../repositories/order.Repository';
import { ProductRepository } from '../repositories/product.Repository';
import type { CreateOrderDTO, UpdateOrderDTO, PaginatedResult, Order } from '../types/types';

export class OrderService {
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.productRepo = new ProductRepository();
  }

  async create(data: CreateOrderDTO) {
    // Validaciones
    if (!data.type || (data.type !== 'entry' && data.type !== 'exit')) {
      throw new Error('Order type must be "entry" or "exit"');
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Validar que todos los items tengan datos válidos
    for (const item of data.items) {
      if (!item.product_id || item.quantity <= 0 || item.price <= 0) {
        throw new Error('All items must have valid product_id, quantity and price');
      }
    }

    // Si es salida, validar stock
    if (data.type === 'exit') {
      for (const item of data.items) {
        const product = await this.productRepo.findById(item.product_id);

        if (!product) {
          throw new Error(`Product with id ${item.product_id} not found`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.quantity}, requested: ${item.quantity}`
          );
        }
      }
    }

    // Si es entrada, verificar que los productos existan
    if (data.type === 'entry') {
      for (const item of data.items) {
        const product = await this.productRepo.findById(item.product_id);
        if (!product) {
          throw new Error(`Product with id ${item.product_id} not found`);
        }
      }
    }

    // Crear orden
    const orderId = await this.orderRepo.create(data);
    return this.orderRepo.findByIdWithItems(orderId);
  }

  async getById(id: number) {
    const order = await this.orderRepo.findByIdWithItems(id);

    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    return order;
  }

  async getAll(page: number, limit: number, type?: 'entry' | 'exit'): Promise<PaginatedResult<Order>> {
    const { orders, total } = await this.orderRepo.findAll(page, limit, type);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(id: number, data: UpdateOrderDTO) {
    // Verificar que existe
    await this.getById(id);

    const updated = await this.orderRepo.update(id, data);

    if (!updated) {
      throw new Error('No changes were made');
    }

    return this.getById(id);
  }

  async delete(id: number) {
    // Verificar que existe
    await this.getById(id);

    await this.orderRepo.delete(id);
  }

  async getStats() {
    return this.orderRepo.getStats();
  }
}