import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
// import { Logger } from '../utils/logger.util';
import { StatusResponse } from '../common/status-response.common';
import { HttpException } from '../exceptions/http-exception.exception';

export class UserController {
    private userService = new UserService();

    async getAllUsers(req: Request, res: Response) {
        try {
            const result = await this.userService.getAllUsers(req.query as any);
            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Users retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
            return;
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'User ID is required'
                });
                return;
            }

            const user = await this.userService.getUserById(id);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'User retrieved successfully',
                data: user
            });
            return;
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const userData = await this.userService.createUser(req.body);
            res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'User created successfully',
                data: userData
            });
            return;
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!id) {
                res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'User ID is required'
                });
                return;
            }

            const userData = await this.userService.updateUser(id, updateData);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'User updated successfully',
                data: userData
            });
            return;
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'User ID is required'
                });
                return;
            }

            await this.userService.deleteUser(id);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'User deleted successfully'
            });
            return;
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
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
            return;
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }
}
