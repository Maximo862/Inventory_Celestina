import { Router } from 'express';
import { ProductController } from '../controllers/product.Controller';
import { authRequired } from '../middlewares/auth.Middleware';
import { requireRole } from '../middlewares/requireRolre.Middleware';

const productRouter = Router();
const controller = new ProductController();

productRouter.get('/', authRequired, requireRole(['admin', 'employee']), controller.getAll);
productRouter.get('/:id', authRequired, requireRole(['admin', 'employee']), controller.getById);
productRouter.post('/', authRequired, requireRole('admin'), controller.create);
productRouter.patch('/:id', authRequired, requireRole('admin'),controller.update);
productRouter.delete('/:id', authRequired, requireRole('admin'),controller.delete);

export default productRouter;  