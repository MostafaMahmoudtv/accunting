import { Router } from 'express';
import * as salaryController from '../controllers/salaryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/me', salaryController.mySalaries);
router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), salaryController.listSalaries);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), salaryController.createSalary);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), salaryController.updateSalary);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), salaryController.deleteSalary);

export default router;
