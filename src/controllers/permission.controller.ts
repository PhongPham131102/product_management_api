import { Request, Response } from 'express';
import { Permission, ActionEnum, SubjectEnum } from '../models/permission.model';
import { Role } from '../models/role.model';
import { Logger } from '../utils/logger.util';
import { StatusResponse } from '../common/status-response.common';
import { subjectMapping, actionMapping, adminRole } from '../constants/role.constant';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
    user?: any;
}

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

            this.logger.verbose(`Permission created for role: ${role.name}`);

            res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'Permission created successfully',
                data: permission
            });
        } catch (error) {
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

            this.logger.verbose(`Permission updated: ${permission._id}`);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Permission updated successfully',
                data: permission
            });
        } catch (error) {
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

            this.logger.verbose(`Permission deleted: ${id}`);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Permission deleted successfully'
            });
        } catch (error) {
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
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }

    async createPermissionRole(req: AuthRequest, res: Response) {
        try {
            const { role, permission } = req.body;
            const user = req.user;
            const userIp = req.ip || req.connection.remoteAddress || 'Unknown';

            if (!role) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Role Name Is Not Empty',
                });
            }

            const checkRole = await Role.findOne({ name: role });
            if (checkRole) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Role Name Already Exist',
                });
            }

            const newRole = await Role.create({ name: role });
            let newData = `Tên role: ${newRole.name}\n`;

            if (Object.entries(permission).length > 0) {
                newData += `Với các quyền hạn cụ thể sau:\n`;
            }

            const permissions = [];
            for (const [key, value] of Object.entries(permission)) {
                const actionArray = value as ActionEnum[];
                if (actionArray.some((e: ActionEnum) => e === ActionEnum.MANAGE)) {
                    const _permission = await Permission.create({
                        role: newRole._id,
                        action: [ActionEnum.MANAGE],
                        subject: key,
                    });
                    newData += `${subjectMapping[key as SubjectEnum] || key} : ${actionMapping['manage']}\n`;
                    permissions.push(_permission);
                } else {
                    const _permission = await Permission.create({
                        role: newRole._id,
                        action: [...actionArray],
                        subject: key,
                    });
                    newData += `${subjectMapping[key as SubjectEnum] || key} : ${actionArray.length > 0 ? actionArray.map((val: ActionEnum) => actionMapping[val] || val).join(', ') : '(Trống)'}\n`;
                    permissions.push(_permission);
                }
            }

            const currentDate = new Date().toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const stringLog = `${user?.username} vừa tạo mới role và quyền hạn với các thông tin sau:\n${newData}\nVào lúc: <b>${currentDate}</b>\nIP người thực hiện: ${userIp}.`;

            (req as any)['new-data'] = newData;
            (req as any)['message-log'] = stringLog;

            this.logger.verbose(`Permission role created: ${newRole.name} by user: ${user?.username}`);

            res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'Create Permission Success',
                data: {
                    role: newRole,
                    permissions,
                },
            });
        } catch (error) {
            this.logger.error('Error creating permission role:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }

    async updatePermissionByRoleId(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { role: roleName, permission } = req.body;
            const user = req.user;

            // Check if trying to update admin role
            if (id === adminRole) {
                return res.status(403).json({
                    status: StatusResponse.FAIL,
                    message: "You Don't Have Permission To Change Admin Role",
                });
            }
            if (!id || !Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: `Invalid Role Id: ${id}`,
                });
            }
            // Find role by ID
            const role = await Role.findById(id);
            if (!role) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: `Not Found Role By Id: ${id}`,
                });
            }

            // Check if role name already exists (excluding current role)
            const checkRoleName = await Role.findOne({
                _id: { $ne: role._id },
                name: roleName,
            });

            if (checkRoleName) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Role Name Already Exist',
                });
            }

            // Update role name
            role.name = roleName;

            // Get old permissions for comparison
            const oldPermissions = await Permission.find({ role: role._id });
            let oldData = `Tên role: ${role.name}\n`;

            if (oldPermissions.length > 0) {
                oldData += `Với các quyền hạn cụ thể sau:\n`;
                for (const pers of oldPermissions) {
                    oldData += `${subjectMapping[pers.subject as keyof typeof subjectMapping] || pers.subject} : ${pers.action?.length ? pers.action.map((val) => actionMapping[val] || val).join(', ') : '(Trống)'}\n`;
                }
            } else {
                oldData += 'Chưa khởi tạo quyền hạn nào.';
            }

            // Update permissions
            const permissions = [];
            let newData = `Tên role: ${role.name}\n`;

            if (Object.entries(permission).length > 0) {
                newData += `Với các quyền hạn cụ thể sau:\n`;
            } else {
                newData += 'Chưa khởi tạo quyền hạn nào';
            }

            for (const [key, value] of Object.entries(permission)) {
                const actionArray = value as ActionEnum[];
                if (actionArray.some((e: ActionEnum) => e === ActionEnum.MANAGE)) {
                    const _permission = await Permission.findOneAndUpdate(
                        {
                            role: id,
                            subject: key,
                        },
                        {
                            action: [ActionEnum.MANAGE],
                            subject: key,
                        },
                        { new: true, upsert: true }
                    );
                    newData += `${subjectMapping[key as keyof typeof subjectMapping] || key} : ${actionMapping['manage']}\n`;
                    permissions.push(_permission);
                } else {
                    const _permission = await Permission.findOneAndUpdate(
                        {
                            role: id,
                            subject: key,
                        },
                        {
                            action: [...actionArray],
                            subject: key,
                        },
                        { new: true, upsert: true }
                    );
                    newData += `${subjectMapping[key as keyof typeof subjectMapping] || key} : ${actionArray?.length ? actionArray.map((val: ActionEnum) => actionMapping[val] || val).join(', ') : '(Trống)'}\n`;
                    permissions.push(_permission);
                }
            }

            // Save role
            await role.save();

            this.logger.verbose(`Permission role updated: ${role.name} by user: ${user?.username}`);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Update Permission Success',
                data: {
                    role,
                    permissions,
                },
            });
        } catch (error) {
            this.logger.error('Error updating permission role:', error);
            res.status(500).json({
                status: StatusResponse.FAIL,
                message: 'Internal server error'
            });
        }
    }
}
