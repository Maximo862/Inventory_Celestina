import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.Service';

export class CategoryController {
    private service: CategoryService;

    constructor() {
        this.service = new CategoryService();
    }

    // Obtener todas (plano con paginación)
    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.service.getAll();

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    // Obtener solo categorías padre
    getParents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parents = await this.service.getParentCategories();

            res.status(200).json(parents);
        } catch (err) {
            next(err);
        }
    };

    // Obtener subcategorías de una categoría
    getSubcategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parentId = Number(req.params.id);

            const subcategories = await this.service.getSubcategories(parentId);

            res.status(200).json(subcategories);
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const category = await this.service.getById(id);

            res.status(200).json(category);
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const category = await this.service.create(req.body);

            res.status(201).json(category);
        } catch (err) {
            next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);

            const category = await this.service.update(id, req.body);

            res.status(200).json(category);
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