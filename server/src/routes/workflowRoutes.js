import { Router } from 'express';
import * as workflowController from '../controllers/workflowController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

// Managers and accountants can read workflows. Customer service does not.
const readAccess = authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT);
router.get('/', readAccess, workflowController.listWorkflows);
router.get('/:id', readAccess, workflowController.getWorkflow);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), workflowController.createWorkflow);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), workflowController.updateWorkflow);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), workflowController.deleteWorkflow);

export default router;
