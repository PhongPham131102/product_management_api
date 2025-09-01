import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permissions/create-permission.dto';
import { CreatePermissionRoleDto } from '../dto/permissions/create-permission-role.dto';

const router = Router();
const permissionController = new PermissionController();

// Protected routes (admin only)
router.get('/', authenticateToken, (req, res) => permissionController.getAllPermissions(req, res));
router.get('/role/:roleId', authenticateToken, (req, res) => permissionController.getPermissionsByRole(req, res));
router.post('/', authenticateToken, validateDto(CreatePermissionDto), (req, res) => permissionController.createPermission(req, res));
router.post('/create-permission-role', authenticateToken, validateDto(CreatePermissionRoleDto), (req, res) => permissionController.createPermissionRole(req, res));
router.put('/:id', authenticateToken, validateDto(UpdatePermissionDto), (req, res) => permissionController.updatePermission(req, res));
router.delete('/:id', authenticateToken, (req, res) => permissionController.deletePermission(req, res));

export default router;
