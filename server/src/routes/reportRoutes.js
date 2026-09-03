import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

// Reports are manager+ only — accountants / customer service don't see financials.
const managersPlus = authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER);

router.get('/financial', managersPlus, reportController.financialReport);
router.get('/clients', managersPlus, reportController.clientReport);
router.get('/team', managersPlus, reportController.teamReport);
router.get('/expense-breakdown', managersPlus, reportController.expenseBreakdown);

export default router;
