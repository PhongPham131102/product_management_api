import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Logger } from '../utils/logger.util';
import { StatusResponse } from '../common/status-response.common';


interface AuthRequest extends Request {
    user?: any;
}

const logger = new Logger('AuthMiddleware');

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                status: 'FAIL',
                error_code: StatusResponse.ACCESS_TOKEN_REQUIRED,
                message: 'Access token is required'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env['JWT_SECRET'] || 'your-secret-key'
        ) as any;

        const user = await User.findById(decoded.userId).populate('role');
        if (!user) {
            return res.status(401).json({
                status: 'FAIL',
                error_code: StatusResponse.USER_NOT_FOUND,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Token verification error:', error);
        return res.status(403).json({
            status: 'FAIL',
            error_code: StatusResponse.INVALID_TOKEN,
            message: 'Invalid or expired token'
        });
    }
};


