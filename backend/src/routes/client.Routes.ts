import { Router } from 'express';
import { ClientController } from '../controllers/client.Controller';
import { authRequired } from '../middlewares/auth.Middleware';
import { requireRole } from '../middlewares/requireRolre.Middleware';

const clientRouter = Router();
const controller = new ClientController();

clientRouter.get('/', authRequired, requireRole(['admin', 'employee']), controller.getAll);
clientRouter.get('/search', authRequired, requireRole(['admin', 'employee']), controller.search);
clientRouter.get('/:id', authRequired, requireRole(['admin', 'employee']), controller.getById);
clientRouter.post('/', authRequired, requireRole('admin'),controller.create);
clientRouter.patch('/:id', authRequired, requireRole('admin'),controller.update);
clientRouter.delete('/:id', authRequired, requireRole('admin'),controller.delete);

export default clientRouter;