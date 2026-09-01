import { Router } from 'express';
import * as workflowController from '../controllers/workflowController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/', workflowController.listWorkflows);
router.get('/:id', workflowController.getWorkflow);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), workflowController.createWorkflow);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), workflowController.updateWorkflow);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), workflowController.deleteWorkflow);

export default router;
