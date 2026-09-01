import { Router } from 'express';
import * as revenueController from '../controllers/revenueController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/', revenueController.listRevenue);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), revenueController.createRevenue);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), revenueController.updateRevenue);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), revenueController.deleteRevenue);

export default router;
