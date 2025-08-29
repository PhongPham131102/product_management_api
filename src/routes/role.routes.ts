import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreateRoleDto, UpdateRoleDto } from '../dto/roles/create-role.dto';

const router = Router();
const roleController = new RoleController();

// Protected routes (admin only)
router.get('/', authenticateToken, (req, res) => roleController.getAll(req, res));
router.get('/:id', authenticateToken, (req, res) => roleController.getById(req, res));
router.post('/', authenticateToken, validateDto(CreateRoleDto), (req, res) => roleController.create(req, res));
router.put('/:id', authenticateToken, validateDto(UpdateRoleDto), (req, res) => roleController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => roleController.delete(req, res));

export default router;
