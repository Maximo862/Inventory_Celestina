import { Router } from 'express';
import { branchController } from '../controllers/branch.Controller';
import { authRequired } from '../middlewares/auth.Middleware';

const router = Router();

router.get('/', authRequired, branchController.getAll);
router.get('/:id', authRequired, branchController.getById);

export default router;