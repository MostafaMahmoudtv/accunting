import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/kanban', taskController.kanbanTasks);
router.get('/my-clients', taskController.myClients);
router.get('/', taskController.listTasks);
router.get('/:id', taskController.getTask);
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  taskController.createTask
);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.changeStatus);
router.post('/:id/comments', taskController.addComment);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), taskController.deleteTask);

export default router;
