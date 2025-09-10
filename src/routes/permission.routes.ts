import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { authenticateToken, } from '../middleware/auth.middleware';
import { authorization } from '../middleware/authorization.middleware';
import { validateDto } from '../middleware/validate-dto.middleware';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permissions/create-permission.dto';
import { CreatePermissionRoleDto } from '../dto/permissions/create-permission-role.dto';
import { UpdatePermissionRoleDto } from '../dto/permissions/update-permission-role.dto';
import { ActionEnum, SubjectEnum } from '../models/permission.model';

const router = Router();
const permissionController = new PermissionController();

// Protected routes (admin only)
router.get('/', authenticateToken, (req, res) => permissionController.getAllPermissions(req, res));
router.get('/get-all-by-role-id/:roleId', authenticateToken, (req, res) => permissionController.getPermissionsByRole(req, res));
router.get('/role/:roleId', authenticateToken, (req, res) => permissionController.getPermissionsByRole(req, res));
router.post('/', authenticateToken, validateDto(CreatePermissionDto), (req, res) => permissionController.createPermission(req, res));
router.post('/create-permission', authenticateToken, authorization(SubjectEnum.ROLE, ActionEnum.CREATE), validateDto(CreatePermissionRoleDto), (req, res) => permissionController.createPermissionRole(req, res));
router.put('/update-permission-by-role-id/:id', authenticateToken, validateDto(UpdatePermissionRoleDto), (req, res) => permissionController.updatePermissionByRoleId(req, res));
router.put('/:id', authenticateToken, validateDto(UpdatePermissionDto), (req, res) => permissionController.updatePermission(req, res));
router.delete('/:id', authenticateToken, (req, res) => permissionController.deletePermission(req, res));

export default router;
