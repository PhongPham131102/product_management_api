import { Types } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { Role } from '../models/role.model';
import { Logger } from '../utils/logger.util';
import { PermissionService } from './permission.service';
import { HttpException } from '../exceptions/http-exception.exception';
import { StatusResponse } from '../common/status-response.common';
const permissionService = new PermissionService()
export class UserService {
    private logger = new Logger('UserService');

    async getAllUsers(query: any = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                role,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = query;

            const filter: any = { isDelete: false };
            if (search) {
                filter.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }
            if (role) {
                filter.role = new Types.ObjectId(role);
            }

            const sort: any = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
                User.find(filter)
                    .populate('role')
                    .select('-password -refresh_token')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
                User.countDocuments(filter)
            ]);

            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return {
                data: users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPrevPage
                }
            };
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

    async updateUser(id: string, updateData: { name?: string; email?: string; username?: string; password?: string; role?: string }) {
        try {
            const { name, email, username, password, role } = updateData;

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

            // Check if username is already taken by another user
            if (username && username !== user.username) {
                const existingUsername = await User.findOne({ username, _id: { $ne: id } });
                if (existingUsername) {
                    throw {
                        status: 400,
                        message: 'Username already exists'
                    };
                }
            }

            user.name = name ?? user.name;
            user.email = email ?? user.email ?? '';
            if (username !== undefined) user.username = username;
            if (password) {
                const bcrypt = await import('bcryptjs');
                user.password = await bcrypt.hash(password, 10);
            }
            if (role) {
                // Check if role exists

                const roleExists = await Role.findOne({ _id: new Types.ObjectId(role) });
                console.log("roleExists: ", roleExists)
                if (!roleExists) {
                    throw new HttpException({
                        status: 400,
                        error_code: StatusResponse.ROLE_BY_ID_NOT_FOUND,
                        message: 'Role not found'
                    });
                }
                user.role = new Types.ObjectId(role) as any;
            }
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
    async createUser(userData: { username: string; password: string; name: string; email?: string; role?: string }) {
        try {
            const { username, password, name, email, role } = userData;

            // Check if username already exists
            const existingUser = await User.findOne({ username, isDelete: false });
            if (existingUser) {
                throw {
                    status: 400,
                    message: 'Username already exists'
                };
            }

            // Check if email already exists (if provided)
            if (email) {
                const existingEmail = await User.findOne({ email, isDelete: false });
                if (existingEmail) {
                    throw {
                        status: 400,
                        message: 'Email already exists'
                    };
                }
            }

            // Check if role exists (if provided)
            if (role) {
                const roleExists = await Role.findOne({ _id: new Types.ObjectId(role) });
                console.log("roleExists: ", roleExists)
                if (!roleExists) {
                    throw new HttpException({
                        status: 400,
                        error_code: StatusResponse.ROLE_BY_ID_NOT_FOUND,
                        message: 'Role not found'
                    });
                }
            }

            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                username,
                password: hashedPassword,
                name,
                email: email || '',
                role: role ? new Types.ObjectId(role) : undefined
            });

            this.logger.verbose(`User created: ${user.username}`);

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
