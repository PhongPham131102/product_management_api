import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permissions/create-permission.dto';

const router = Router();
const permissionController = new PermissionController();

// Protected routes (admin only)
router.get('/', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => permissionController.getAllPermissions(req, res));
router.get('/role/:roleId', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => permissionController.getPermissionsByRole(req, res));
router.post('/', authenticateToken, authorizeRoles('Supper Admin'), validateDto(CreatePermissionDto), (req, res) => permissionController.createPermission(req, res));
router.put('/:id', authenticateToken, authorizeRoles('Supper Admin'), validateDto(UpdatePermissionDto), (req, res) => permissionController.updatePermission(req, res));
router.delete('/:id', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => permissionController.deletePermission(req, res));

// Utility routes
router.get('/actions/available', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => permissionController.getAvailableActions(req, res));
router.get('/subjects/available', authenticateToken, authorizeRoles('Supper Admin'), (req, res) => permissionController.getAvailableSubjects(req, res));

export default router;
