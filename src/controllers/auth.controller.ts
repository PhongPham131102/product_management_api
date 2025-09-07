import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { Logger } from '../utils/logger.util';
import { StatusResponse } from '../common/status-response.common';
import { HttpException } from '../exceptions/http-exception.exception';

export class AuthController {
    private logger = new Logger('AuthController');
    private authService = new AuthService();

    async register(req: Request, res: Response) {
        try {
            const { email, password, username, name } = req.body;
            const userData = await this.authService.registerUser({ email, password, username, name });

            res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'User registered successfully',
                data: userData
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            const loginData = await this.authService.loginUser({ username, password });

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Login successful',
                data: loginData
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            await this.authService.logoutUser(refreshToken);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Logout successful'
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            const tokenData = await this.authService.refreshAccessToken(refreshToken);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Token refreshed successfully',
                data: tokenData
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            res.status(error.status || 401).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Invalid refresh token'
            });
        }
    }
}
