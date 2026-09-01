import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(protect);

router.get('/roles', userController.getRoles);

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), userController.listUsers);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), userController.createUser);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER), userController.updateUser);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN), userController.deleteUser);

export default router;
