import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

// Managers and accountants can browse the full client list. Customer
// service users see clients only through their assigned tasks, not directly.
const managersPlusAccountant = authorize(
  ROLES.SUPER_ADMIN,
  ROLES.MANAGER,
  ROLES.ACCOUNTANT,
);

router.get('/stats', managersPlusAccountant, clientController.clientStats);
router.get('/', managersPlusAccountant, clientController.listClients);
router.get('/:id', managersPlusAccountant, clientController.getClient);
router.get('/:id/summary', managersPlusAccountant, clientController.clientSummary);

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
