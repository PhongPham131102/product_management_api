import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Logger } from '../utils/logger.util';
import { StatusResponse } from '../common/status-response.common';
import { UserService } from './user.service';
import { PermissionService } from './permission.service';

export class AuthService {
    private logger = new Logger('AuthService');
    private userService = new UserService();
    private permissionService = new PermissionService();

    async registerUser(userData: { email: string; password: string; username: string; name: string }) {
        try {
            const { email, password, username, name } = userData;

            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                throw {
                    status: 400,
                    status_response: StatusResponse.EXISTS_USERNAME,
                    message: 'User already exists'
                };
            }
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                throw {
                    status: 400,
                    status_response: StatusResponse.EXISTS_EMAIL,
                    message: 'Email already exists'
                };
            }

            const hashedPassword = await bcrypt.hash(password, 10);


            const defaultRole = await Role.findOne({ name: 'user' });
            if (!defaultRole) {
                throw {
                    status: 500,
                    message: 'Default role not found'
                };
            }

            // Create user
            const user = await User.create({
                email,
                password: hashedPassword,
                username,
                name,
                role: defaultRole._id
            });

            return {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name
            };
        } catch (error) {
            throw error;
        }
    }

    async loginUser(credentials: { username: string; password: string }) {
        try {
            const { username, password } = credentials;

            // Find user
            const user = await User.findOne({ username }).select('+password').populate('role');
            if (!user) {
                throw {
                    status: 401,
                    message: 'Invalid credentials'
                };
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password!);
            if (!isPasswordValid) {
                throw {
                    status: 401,
                    message: 'Invalid credentials'
                };
            }

            // Disallow customer role to login
            if (user.role && (user.role as any).name && String((user.role as any).name).toLowerCase() === 'customer') {
                throw {
                    status: 403,
                    message: 'Customer role is not allowed to login'
                };
            }

            const permission = await this.permissionService.getPermissionByRole(user?.role?.id);

            // Generate tokens
            const accessToken = jwt.sign(
                { userId: user._id, role: (user.role as any).name },
                (process.env['JWT_SECRET'] || 'your-secret-key') as jwt.Secret,
                { expiresIn: (process.env['JWT_EXPIRES_IN'] || '15m') as any }
            );

            const refreshToken = jwt.sign(
                { userId: user._id },
                (process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret') as jwt.Secret,
                { expiresIn: (process.env['JWT_REFRESH_EXPIRES_IN'] || '7d') as any }
            );

            // Save refresh token
            user.refresh_token = refreshToken;
            await user.save();

            this.logger.verbose(`User logged in: ${user.username}`);

            return {
                accessToken,
                refreshToken,
                role: user?.role,
                permission,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    role: user.role.name
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async logoutUser(refreshToken: string) {
        try {
            if (!refreshToken) {
                throw {
                    status: 400,
                    message: 'Refresh token is required'
                };
            }

            // Clear refresh token
            await User.findOneAndUpdate(
                { refresh_token: refreshToken },
                { refresh_token: '' }
            );

            this.logger.verbose('User logged out');
            return true;
        } catch (error) {
            throw error;
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            if (!refreshToken) {
                throw {
                    status: 400,
                    message: 'Refresh token is required'
                };
            }

            // Verify refresh token
            const decoded = jwt.verify(
                refreshToken,
                process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret'
            ) as any;

            // Find user
            const user = await User.findById(decoded.userId).populate('role');
            if (!user || user.refresh_token !== refreshToken) {
                throw {
                    status: 401,
                    message: 'Invalid refresh token'
                };
            }

            // Generate new access token
            const newAccessToken = jwt.sign(
                { userId: user._id, role: (user.role as any).name },
                (process.env['JWT_SECRET'] || 'your-secret-key') as jwt.Secret,
                { expiresIn: '15m' as any }
            );

            return {
                accessToken: newAccessToken
            };
        } catch (error) {
            throw error;
        }
    }
}
