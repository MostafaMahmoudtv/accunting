import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

// Only managers+ can browse the full client list. Customer service /
// accountants see clients only through their assigned tasks, not directly.
const managersPlus = authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER);

router.get('/stats', managersPlus, clientController.clientStats);
router.get('/', managersPlus, clientController.listClients);
router.get('/:id', managersPlus, clientController.getClient);
router.get('/:id/summary', managersPlus, clientController.clientSummary);

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
