import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/financial', reportController.financialReport);
router.get('/clients', reportController.clientReport);
router.get('/team', reportController.teamReport);
router.get('/expense-breakdown', reportController.expenseBreakdown);

export default router;
