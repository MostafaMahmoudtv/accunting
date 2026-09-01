import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/stats', clientController.clientStats);
router.get('/:id/summary', clientController.clientSummary);
router.get('/', clientController.listClients);
router.get('/:id', clientController.getClient);

router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER),
  clientController.createClient
);
router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  clientController.updateClient
);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), clientController.deleteClient);
router.post('/:id/notes', clientController.addNote);

export default router;
