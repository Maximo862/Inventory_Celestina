import { Router } from 'express';
import { CategoryController } from '../controllers/category.Controller';
import { authRequired } from "../middlewares/auth.Middleware";

const categoryRouter = Router();
const controller = new CategoryController();

categoryRouter.get('/', controller.getAll);
categoryRouter.get('/parents', controller.getParents);
categoryRouter.get('/:id/subcategories', controller.getSubcategories);
categoryRouter.get('/:id', authRequired, controller.getById);
categoryRouter.post('/', authRequired, controller.create);
categoryRouter.patch('/:id', authRequired, controller.update);
categoryRouter.delete('/:id', authRequired, controller.delete);

export default categoryRouter;