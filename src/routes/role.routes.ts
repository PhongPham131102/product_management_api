import { Router } from 'express';
import { RoleService } from '../controllers/role.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreateRoleDto, UpdateRoleDto } from '../dto/roles/create-role.dto';

const router = Router();
const roleService = new RoleService();

// Protected routes (admin only)
router.get('/', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => roleService.getAll(req, res));
router.get('/:id', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => roleService.getById(req, res));
router.post('/', authenticateToken, authorizeRoles('Supper Admin'), validateDto(CreateRoleDto), (req, res) => roleService.create(req, res));
router.put('/:id', authenticateToken, authorizeRoles('Supper Admin'), validateDto(UpdateRoleDto), (req, res) => roleService.update(req, res));
router.delete('/:id', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => roleService.delete(req, res));

export default router;
