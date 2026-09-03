import { Router } from 'express';
import * as expenseController from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

// Managers, super admins, and customer service can record expenses.
// Accountants are intentionally excluded (they focus on tasks/clients/workflows).
const canRecord = authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CUSTOMER_SERVICE);
const canManage = authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER);

router.get('/', canRecord, expenseController.listExpenses);
router.post('/', canRecord, expenseController.createExpense);
router.put('/:id', canManage, expenseController.updateExpense);
router.delete('/:id', canManage, expenseController.deleteExpense);

export default router;
