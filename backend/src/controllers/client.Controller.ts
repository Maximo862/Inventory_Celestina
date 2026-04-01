import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/client.Service';

export class ClientController {
    private service: ClientService;

    constructor() {
        this.service = new ClientService();
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            // Filtros
            const search = req.query.search as string | undefined;
            const filters = {
                ...(search && { search })
            };

            // Ordenamiento
            const sortField = req.query.sortField as string || 'id';
            const sortOrder = (req.query.sortOrder as string || 'DESC').toUpperCase() as 'ASC' | 'DESC';
            const sort = { field: sortField, order: sortOrder };

            const branchId = req.user!.branch_id;
            const result = await this.service.getAll({ page, limit }, branchId, filters, sort);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const branchId = req.user!.branch_id;

            const client = await this.service.getById(id, branchId);

            res.status(200).json(client);
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branchId = req.user!.branch_id;
            const client = await this.service.create(req.body, branchId);

            res.status(201).json(client);
        } catch (err) {
            next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const branchId = req.user!.branch_id;

            const client = await this.service.update(id, req.body, branchId);

            res.status(200).json(client);
        } catch (err) {
            next(err);
        }
    };

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

    search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query = req.query.query as string;
            const limit = parseInt(req.query.limit as string) || 10;
            const branchId = req.user!.branch_id;

            const results = await this.service.search(query, branchId, limit);

            res.status(200).json(results);
        } catch (err) {
            next(err);
        }
    };
}