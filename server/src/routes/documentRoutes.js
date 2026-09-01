import { Router } from 'express';
import * as documentController from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/', documentController.listDocuments);
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  documentController.uploadMiddleware.single('file'),
  documentController.createDocument
);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), documentController.deleteDocument);

export default router;
