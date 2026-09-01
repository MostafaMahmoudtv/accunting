import { Router } from 'express';
import * as activityController from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', activityController.listActivity);
export default router;
