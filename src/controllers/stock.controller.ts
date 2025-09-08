import { Request, Response } from 'express';
import { StockService } from '../services/stock.service';
import { StatusResponse } from '../common/status-response.common';
import { CreateStockDto } from '../dto/stocks/create-stock.dto';
import { UpdateStockDto } from '../dto/stocks/update-stock.dto';
import { StockQueryDto } from '../dto/stocks/stock-query.dto';
import { HttpException } from '../exceptions/http-exception.exception';

export class StockController {

    private stockService = new StockService();

    async getAllStocks(req: Request, res: Response) {
        try {
            const queryDto: StockQueryDto = req.query as any;
            const result = await this.stockService.getAllStocks(queryDto);

            res.json({
                status: StatusResponse.SUCCESS,
                message: 'Stocks retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getStockById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Stock ID is required'
                });
            }

            const stock = await this.stockService.getStockById(id);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Stock retrieved successfully',
                data: stock
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async createStock(req: Request, res: Response) {
        try {
            const createStockDto: CreateStockDto = req.body;

            const stock = await this.stockService.createStock(createStockDto);

            return res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'Stock created successfully',
                data: stock
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async updateStock(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateStockDto: UpdateStockDto = req.body;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Stock ID is required'
                });
            }

            const stock = await this.stockService.updateStock(id, updateStockDto);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Stock updated successfully',
                data: stock
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async deleteStock(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Stock ID is required'
                });
            }

            await this.stockService.deleteStock(id);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Stock deleted successfully'
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }
}
