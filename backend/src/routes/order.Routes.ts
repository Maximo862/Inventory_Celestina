import { Router } from 'express';
import { OrderController } from '../controllers/order.Controller';
import { authRequired } from '../middlewares/auth.Middleware';

const orderRouter = Router();
const controller = new OrderController();

// Todas las rutas requieren autenticación
orderRouter.get('/stats', authRequired, controller.getStats);  // ANTES de /:id
orderRouter.get('/', authRequired, controller.getAll);
orderRouter.get('/:id', authRequired, controller.getById);
orderRouter.post('/', authRequired, controller.create);
orderRouter.patch('/:id', authRequired, controller.update);
orderRouter.delete('/:id', authRequired, controller.delete);

export default orderRouter;