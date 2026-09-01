import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/stats', dashboardController.dashboardStats);
router.get('/activity', dashboardController.recentActivity);
router.get('/alerts', dashboardController.alerts);

export default router;
