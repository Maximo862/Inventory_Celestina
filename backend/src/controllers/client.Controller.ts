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

            const result = await this.service.getAll({ page, limit });

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const client = await this.service.getById(id);

            res.status(200).json(client);
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const client = await this.service.create(req.body);

            res.status(201).json(client);
        } catch (err) {
            next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const client = await this.service.update(id, req.body);

            res.status(200).json(client);
        } catch (err) {
            next(err);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            await this.service.delete(id);

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };
}