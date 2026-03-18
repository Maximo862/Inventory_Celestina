import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.Service';

export class ProductController {
    private service: ProductService;

    constructor() {
        this.service = new ProductService();
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const search = req.query.search as string | undefined;
            const category_id = req.query.category_id
                ? parseInt(req.query.category_id as string)
                : undefined;

            const sort = req.query.sort as string | undefined;
            const order = req.query.order as 'asc' | 'desc' | undefined;

            const filters = {
                ...(search && { search }),
                ...(category_id && { category_id })
            };

            const sortParams = {
                ...(sort && { sort }),
                ...(order && { order })
            };

            const result = await this.service.getAll({ page, limit }, filters, sortParams);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const product = await this.service.getById(id);

            res.status(200).json(product);
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const product = await this.service.create(req.body);

            res.status(201).json(product);
        } catch (err) {
            next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const product = await this.service.update(id, req.body);

            res.status(200).json(product);
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