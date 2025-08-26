import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { UpdateUserDto } from '../dto/users/create-user.dto';

const router = Router();
const userController = new UserController();

// Public routes
router.get('/profile', authenticateToken, userController.getProfile);

// Protected routes (admin only)
router.get('/', authenticateToken, authorizeRoles('Supper Admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles('Supper Admin'), userController.getUserById);
router.put('/:id', authenticateToken, authorizeRoles('Supper Admin'), validateDto(UpdateUserDto), userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('Supper Admin'), userController.deleteUser);

export default router;
