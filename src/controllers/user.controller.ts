import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { Logger } from '../utils/logger.util';
import { StatusResponse } from '../common/status-response.common';

export class UserController {
    private logger = new Logger('UserController');
    private userService = new UserService();

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await this.userService.getAllUsers();

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Users retrieved successfully',
                data: users
            });
        } catch (error: any) {
            this.logger.error('Get all users error:', error);
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'User ID is required'
                });
            }

            const user = await this.userService.getUserById(id);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error: any) {
            this.logger.error('Get user by ID error:', error);
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, email } = req.body;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'User ID is required'
                });
            }

            const userData = await this.userService.updateUser(id, { name, email });

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'User updated successfully',
                data: userData
            });
        } catch (error: any) {
            this.logger.error('Update user error:', error);
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'User ID is required'
                });
            }

            await this.userService.deleteUser(id);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'User deleted successfully'
            });
        } catch (error: any) {
            this.logger.error('Delete user error:', error);
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            const user = await this.userService.getUserProfile(userId);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Profile retrieved successfully',
                data: user
            });
        } catch (error: any) {
            this.logger.error('Get profile error:', error);
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }
}
