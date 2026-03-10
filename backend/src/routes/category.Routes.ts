import { Router } from 'express';
import { CategoryController } from '../controllers/category.Controller';
import { authRequired } from "../middlewares/auth.Middleware";
import { requireRole } from '../middlewares/requireRolre.Middleware';

const categoryRouter = Router();
const controller = new CategoryController();

categoryRouter.get('/', authRequired, requireRole('admin'), controller.getAll);
categoryRouter.get('/parents', authRequired, requireRole('admin'), controller.getParents);
categoryRouter.get('/:id/subcategories', authRequired, requireRole('admin'), controller.getSubcategories);
categoryRouter.get('/:id', authRequired, requireRole('admin'), controller.getById);
categoryRouter.post('/', authRequired, requireRole('admin'), controller.create);
categoryRouter.patch('/:id', authRequired, requireRole('admin'), controller.update);
categoryRouter.delete('/:id', authRequired, requireRole('admin'), controller.delete);

export default categoryRouter;