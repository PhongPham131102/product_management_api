import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { StatusResponse } from '../common/status-response.common';
import { HttpException } from '../exceptions/http-exception.exception';

export class DashboardController {
    private service = new DashboardService();

    async summary(_req: Request, res: Response) {
        try {
            const data = await this.service.getSummary();
            return res.json({ status: StatusResponse.SUCCESS, message: 'OK', data });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            return res.status(500).json({ status: StatusResponse.FAIL, message: 'Internal server error' });
        }
    }

    async monthlyRevenue(req: Request, res: Response) {
        try {
            const year = req.query['year'] ? Number(req.query['year']) : undefined;
            const data = await this.service.getMonthlyRevenue(year);
            return res.json({ status: StatusResponse.SUCCESS, message: 'OK', data });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            return res.status(500).json({ status: StatusResponse.FAIL, message: 'Internal server error' });
        }
    }

    async lowStock(req: Request, res: Response) {
        try {
            const limit = req.query['limit'] ? Number(req.query['limit']) : 10;
            const data = await this.service.getLowStock(limit);
            return res.json({ status: StatusResponse.SUCCESS, message: 'OK', data });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            return res.status(500).json({ status: StatusResponse.FAIL, message: 'Internal server error' });
        }
    }

    async stockOverview(req: Request, res: Response) {
        try {
            const limit = req.query['limit'] ? Number(req.query['limit']) : 50;
            const data = await this.service.getStockOverview(limit);
            return res.json({ status: StatusResponse.SUCCESS, message: 'OK', data });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            return res.status(500).json({ status: StatusResponse.FAIL, message: 'Internal server error' });
        }
    }

    async recentOrders(req: Request, res: Response) {
        try {
            const limit = req.query['limit'] ? Number(req.query['limit']) : 10;
            const data = await this.service.getRecentOrders(limit);
            return res.json({ status: StatusResponse.SUCCESS, message: 'OK', data });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            return res.status(500).json({ status: StatusResponse.FAIL, message: 'Internal server error' });
        }
    }
}


