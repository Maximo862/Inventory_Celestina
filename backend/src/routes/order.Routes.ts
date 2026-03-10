import { Router } from 'express';
import { OrderController } from '../controllers/order.Controller';
import { authRequired } from '../middlewares/auth.Middleware';
import { requireRole } from '../middlewares/requireRolre.Middleware';

const orderRouter = Router();
const controller = new OrderController();

// Todas las rutas requieren autenticación
orderRouter.get('/stats', authRequired, requireRole(['admin', 'employee']), controller.getStats);  // ANTES de /:id
orderRouter.get('/', authRequired, requireRole(['admin', 'employee']), controller.getAll);
orderRouter.get('/:id', authRequired, requireRole(['admin', 'employee']), controller.getById);
orderRouter.post('/', authRequired, requireRole(['admin', 'employee']), controller.create);
orderRouter.patch('/:id', authRequired, requireRole(['admin', 'employee']), controller.update);
orderRouter.delete('/:id', authRequired, requireRole(['admin', 'employee']), controller.delete);

export default orderRouter;