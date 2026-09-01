import { Router } from 'express';
import * as expenseController from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/', expenseController.listExpenses);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), expenseController.createExpense);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), expenseController.updateExpense);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), expenseController.deleteExpense);

export default router;
