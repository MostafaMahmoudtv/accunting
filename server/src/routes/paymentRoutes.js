import { Router } from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/stats', paymentController.paymentStats);
router.get('/', paymentController.listPayments);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), paymentController.createPayment);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), paymentController.updatePayment);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), paymentController.deletePayment);

export default router;
