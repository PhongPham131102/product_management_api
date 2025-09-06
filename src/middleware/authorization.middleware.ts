import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

import { UserDocument } from '../models/user.model';
import { UserService } from '../services/user.service';
import { ActionEnum, SubjectEnum } from '../models/permission.model';
import { PermissionService } from '../services/permission.service';
import { StatusResponse } from '../common/status-response.common';
interface AuthRequest extends Request {
    user?: UserDocument;
}
// Khởi tạo singleton service
const userService = new UserService();
const permissionService = new PermissionService();

export const authorization = (subject?: SubjectEnum, action?: ActionEnum) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // --- Auth ---
            const authHeader = req.headers['authorization'];
            console.log("authHeader: ", authHeader)
            if (!authHeader) return res.status(401).json({
                status: 'FAIL',
                error_code: StatusResponse.INVALID_TOKEN,
                message: 'Invalid or expired token'
            });

            const [type, token] = authHeader.split(' ');
            if (type !== 'Bearer' || !token) {
                console.log("sdfd")
                return res.status(401).json({
                    status: 'FAIL',
                    error_code: StatusResponse.INVALID_TOKEN,
                    message: 'Invalid or expired token'
                });
            }

            const payload: any = jwt.verify(token.trim(), process.env["JWT_SECRET"] || 'xOGynFsiRZ');

            if (!payload.userId) return res.status(401).json({
                status: 'FAIL',
                error_code: StatusResponse.INVALID_TOKEN,
                message: 'Invalid or expired token'
            });

            const user = await userService.getUserByIdAuthGuard(payload.userId);
            if (!user) return res.status(401).json({
                status: 'FAIL',
                error_code: StatusResponse.INVALID_TOKEN,
                message: 'Invalid or expired token'
            });

            req['user'] = user;

            // --- Roles ---
            if (!subject || !action) return next();

            if (!user.permission || !user.permission.length) {
                return res.status(403).json({
                    status: 'FAIL',
                    error_code: StatusResponse.FORBIDDEN,
                    message: 'Bạn không có quyền truy cập'
                });
            }

            // Check admin manage all
            const checkRoleAdmin = await permissionService.findOneBy({
                role: user.role._id,
                subject: 'all',
                action: 'manage',
            });
            if (checkRoleAdmin) return next();

            const getRolePermission = await permissionService.findOneBy({
                role: user.role._id,
                subject,
                action,
            });
            if (getRolePermission) return next();

            return res.status(403).json({
                status: 'FAIL',
                error_code: StatusResponse.FORBIDDEN,
                message: 'Bạn không có quyền truy cập'
            });
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return res.status(401).json({
                    status: 'FAIL',
                    error_code: StatusResponse.EXPIRED_ACCESS_TOKEN,
                    message: 'EXPIRED_ACCESS_TOKEN'
                });
            }
            return res.status(401).json({
                status: 'FAIL',
                error_code: StatusResponse.INVALID_TOKEN,
                message: 'Invalid or expired token'
            });
        }
    };
};
