import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.Service';
import { UpdateCategoryPricesDTO } from '../types/types';

export class CategoryController {
    private service: CategoryService;

    constructor() {
        this.service = new CategoryService();
    }

    // Obtener todas (plano con paginación)
    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branchId = req.user!.branch_id;
            const result = await this.service.getAll(branchId);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    getParents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branchId = req.user!.branch_id;
            const parents = await this.service.getParentCategories(branchId);

            res.status(200).json(parents);
        } catch (err) {
            next(err);
        }
    };

    getSubcategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parentId = Number(req.params.id);
            const branchId = req.user!.branch_id;

            const subcategories = await this.service.getSubcategories(parentId, branchId);

            res.status(200).json(subcategories);
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const branchId = req.user!.branch_id;

            const category = await this.service.getById(id, branchId);

            res.status(200).json(category);
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branchId = req.user!.branch_id;
            const category = await this.service.create(req.body, branchId);

            res.status(201).json(category);
        } catch (err) {
            next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const branchId = req.user!.branch_id;

            const category = await this.service.update(id, req.body, branchId);

            res.status(200).json(category);
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

    previewPrices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const data: UpdateCategoryPricesDTO = req.body;
            const branchId = req.user!.branch_id;

            const result = await this.service.previewPrices(id, data, branchId);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    updatePrices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const data: UpdateCategoryPricesDTO = req.body;
            const branchId = req.user!.branch_id;

            const result = await this.service.updatePrices(id, data, branchId);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };
}