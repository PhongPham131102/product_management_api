import { Request, Response } from 'express';
import { Permission, ActionEnum, SubjectEnum } from '../models/permission.model';
import { Role } from '../models/role.model';
import { Logger } from '../utils/logger.util';
import { StatusResponse } from '../common/status-response.common';

export class PermissionController {
    private logger = new Logger('PermissionController');

    async getAllPermissions(req: Request, res: Response) {
        try {
            const permissions = await Permission.find()
                .populate('role', 'name');

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Permissions retrieved successfully',
                data: permissions
            });
        } catch (error) {
            this.logger.error('Get all permissions error:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }

    async getPermissionsByRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const permissions = await Permission.find({ role: roleId })
                .populate('role', 'name');

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Role permissions retrieved successfully',
                data: permissions
            });
        } catch (error) {
            this.logger.error('Get permissions by role error:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }

    async createPermission(req: Request, res: Response) {
        try {
            const { roleId, action, subject } = req.body;

            // Validate role exists
            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(404).json({
                    status: StatusResponse.NOTFOUND,
                    message: 'Role not found'
                });
            }

            // Check if permission already exists
            const existingPermission = await Permission.findOne({
                role: roleId,
                subject
            });

            if (existingPermission) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Permission already exists for this role and subject'
                });
            }

            const permission = await Permission.create({
                role: roleId,
                action,
                subject
            });

            await permission.populate('role', 'name');

            this.logger.info(`Permission created for role: ${role.name}`);

            res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'Permission created successfully',
                data: permission
            });
        } catch (error) {
            this.logger.error('Create permission error:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }

    async updatePermission(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { action } = req.body;

            const permission = await Permission.findById(id);
            if (!permission) {
                return res.status(404).json({
                    status: StatusResponse.NOTFOUND,
                    message: 'Permission not found'
                });
            }

            permission.action = action;
            await permission.save();
            await permission.populate('role', 'name');

            this.logger.info(`Permission updated: ${permission._id}`);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Permission updated successfully',
                data: permission
            });
        } catch (error) {
            this.logger.error('Update permission error:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }

    async deletePermission(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const permission = await Permission.findByIdAndDelete(id);

            if (!permission) {
                return res.status(404).json({
                    status: StatusResponse.NOTFOUND,
                    message: 'Permission not found'
                });
            }

            this.logger.info(`Permission deleted: ${id}`);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Permission deleted successfully'
            });
        } catch (error) {
            this.logger.error('Delete permission error:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }

    async getAvailableActions(req: Request, res: Response) {
        try {
            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Available actions retrieved successfully',
                data: Object.values(ActionEnum)
            });
        } catch (error) {
            this.logger.error('Get available actions error:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }

    async getAvailableSubjects(req: Request, res: Response) {
        try {
            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Available subjects retrieved successfully',
                data: Object.values(SubjectEnum)
            });
        } catch (error) {
            this.logger.error('Get available subjects error:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }
}
