import { Router } from 'express';
import { RoleService } from '../controllers/role.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreateRoleDto, UpdateRoleDto } from '../dto/roles/create-role.dto';

const router = Router();
const roleService = new RoleService();

// Protected routes (admin only)
router.get('/', authenticateToken, authorizeRoles('Supper Admin'), roleService.getAll);
router.get('/:id', authenticateToken, authorizeRoles('Supper Admin'), roleService.getById);
router.post('/', authenticateToken, authorizeRoles('Supper Admin'), validateDto(CreateRoleDto), roleService.create);
router.put('/:id', authenticateToken, authorizeRoles('Supper Admin'), validateDto(UpdateRoleDto), roleService.update);
router.delete('/:id', authenticateToken, authorizeRoles('Supper Admin'), roleService.delete);

export default router;
