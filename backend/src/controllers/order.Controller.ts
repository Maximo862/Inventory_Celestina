import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.Service';

export class OrderController {
    private service: OrderService;

    constructor() {
        this.service = new OrderService();
    }

    // Obtener todas las órdenes con paginación y filtros
    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const type = req.query.type as 'entry' | 'exit' | undefined;
            const search = req.query.search as string | undefined;
            
            let branch_id: number | undefined;
            if (req.query.branch_id) {
                const parsed = parseInt(req.query.branch_id as string);
                if (isNaN(parsed)) {
                    res.status(400).json({ message: 'branch_id must be a number' });
                    return;
                }
                branch_id = parsed;
            }

            const filters = {
                ...(type && { type }),
                ...(search && { search }),
                ...(branch_id && { branch_id })
            };

            const result = await this.service.getAll({ page, limit }, filters);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    // Obtener una orden por ID con sus items
    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const order = await this.service.getById(id);

            res.status(200).json(order);
        } catch (err) {
            next(err);
        }
    };

    // Crear una nueva orden (entrada o salida)
    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branchId = req.user!.branch_id;
            const order = await this.service.create(req.body, branchId);

            res.status(201).json(order);
        } catch (err) {
            next(err);
        }
    };

    // Actualizar orden (solo client_id y notes, no items)
    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const branchId = req.user!.branch_id;

            const order = await this.service.update(id, req.body, branchId);

            res.status(200).json(order);
        } catch (err) {
            next(err);
        }
    };

    // Eliminar orden (revierte stock automáticamente)
    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const branchId = req.user!.branch_id;

            await this.service.delete(id, branchId);

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };

    // Obtener estadísticas de órdenes
    getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Stats globales (sin filtro de branch)
            const stats = await this.service.getStats();

            res.status(200).json(stats);
        } catch (err) {
            next(err);
        }
    };
}