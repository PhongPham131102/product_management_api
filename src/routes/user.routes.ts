import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { UpdateUserDto } from '../dto/users/create-user.dto';

const router = Router();
const userController = new UserController();

// Public routes
router.get('/profile', authenticateToken, (req, res) => userController.getProfile(req, res));

// Protected routes (admin only)
router.get('/', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => userController.getAllUsers(req, res));
router.get('/:id', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => userController.getUserById(req, res));
router.put('/:id', authenticateToken, authorizeRoles('Supper Admin'), validateDto(UpdateUserDto), (req, res) => userController.updateUser(req, res));
router.delete('/:id', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => userController.deleteUser(req, res));

export default router;
