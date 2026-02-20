import { Router } from 'express';
import { ClientController } from '../controllers/client.Controller';
import { authRequired } from '../middlewares/auth.Middleware';

const clientRouter = Router();
const controller = new ClientController();

clientRouter.get('/',controller.getAll);
clientRouter.get('/:id', authRequired,controller.getById);
clientRouter.post('/', authRequired,controller.create);
clientRouter.patch('/:id', authRequired,controller.update);
clientRouter.delete('/:id', authRequired,controller.delete);

export default clientRouter;