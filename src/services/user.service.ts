import { Types } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { Logger } from '../utils/logger.util';
import { PermissionService } from './permission.service';
const permissionService = new PermissionService()
export class UserService {
    private logger = new Logger('UserService');

    async getAllUsers() {
        try {
            const users = await User.find({ isDelete: false })
                .populate('role')
                .select('-password -refresh_token');

            return users;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(id: string) {
        try {
            const user = await User.findById(id)
                .populate('role')
                .select('-password -refresh_token');

            if (!user || user.isDelete) {
                throw {
                    status: 404,
                    message: 'User not found'
                };
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    async updateUser(id: string, updateData: { name?: string; email?: string }) {
        try {
            const { name, email } = updateData;

            const user = await User.findById(id);
            if (!user || user.isDelete) {
                throw {
                    status: 404,
                    message: 'User not found'
                };
            }

            // Check if email is already taken by another user
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ email, _id: { $ne: id } });
                if (existingUser) {
                    throw {
                        status: 400,
                        message: 'Email already exists'
                    };
                }
            }

            user.name = name || user.name;
            user.email = email || user.email || '';
            await user.save();

            this.logger.verbose(`User updated: ${user.username}`);

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

    async deleteUser(id: string) {
        try {
            const user = await User.findById(id);

            if (!user || user.isDelete) {
                throw {
                    status: 404,
                    message: 'User not found'
                };
            }

            // Soft delete
            user.isDelete = true;
            await user.save();

            this.logger.verbose(`User deleted: ${user.username}`);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async getUserProfile(userId: string) {
        try {
            const user = await User.findById(userId)
                .populate('role')
                .select('-password -refresh_token');

            if (!user) {
                throw {
                    status: 404,
                    message: 'User not found'
                };
            }

            return user;
        } catch (error) {
            throw error;
        }
    }
    async getUserByIdAuthGuard(id: string) {
        if (!id) {
            return null;
        }
        const user: UserDocument | null = await User
            .findOne({ _id: new Types.ObjectId(id), isDelete: false })
            .populate('role');
        if (!user) {
            return null;
        }
        const findPermission = await permissionService.getPermissionByRole(
            user.role._id as Types.ObjectId,
        );

        return {
            ...user.toObject(),
            permission: findPermission,
        };
    }
}
