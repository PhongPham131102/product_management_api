import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permissions/create-permission.dto';

const router = Router();
const permissionController = new PermissionController();

// Protected routes (admin only)
router.get('/', authenticateToken, authorizeRoles('Supper Admin'), permissionController.getAllPermissions);
router.get('/role/:roleId', authenticateToken, authorizeRoles('Supper Admin'), permissionController.getPermissionsByRole);
router.post('/', authenticateToken, authorizeRoles('Supper Admin'), validateDto(CreatePermissionDto), permissionController.createPermission);
router.put('/:id', authenticateToken, authorizeRoles('Supper Admin'), validateDto(UpdatePermissionDto), permissionController.updatePermission);
router.delete('/:id', authenticateToken, authorizeRoles('Supper Admin'), permissionController.deletePermission);

// Utility routes
router.get('/actions/available', authenticateToken, authorizeRoles('Supper Admin'), permissionController.getAvailableActions);
router.get('/subjects/available', authenticateToken, authorizeRoles('Supper Admin'), permissionController.getAvailableSubjects);

export default router;
