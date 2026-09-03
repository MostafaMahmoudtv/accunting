import { Router } from 'express';
import * as activityController from '../controllers/activityController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);
router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER),
  activityController.listActivity
);
export default router;
