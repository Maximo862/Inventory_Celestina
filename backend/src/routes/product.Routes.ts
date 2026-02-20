import { Router } from 'express';
import { ProductController } from '../controllers/product.Controller';
import { authRequired } from '../middlewares/auth.Middleware';

const productRouter = Router();
const controller = new ProductController();

productRouter.get('/',controller.getAll);
productRouter.get('/:id', authRequired,controller.getById);
productRouter.post('/', authRequired,controller.create);
productRouter.patch('/:id', authRequired,controller.update);
productRouter.delete('/:id', authRequired,controller.delete);

export default productRouter;