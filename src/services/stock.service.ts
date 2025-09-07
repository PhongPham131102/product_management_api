import { Stock, StockStatusEnum } from '../models/stock.model';
import { Logger } from '../utils/logger.util';
import { CreateStockDto } from '../dto/stocks/create-stock.dto';
import { UpdateStockDto } from '../dto/stocks/update-stock.dto';
import { StockQueryDto } from '../dto/stocks/stock-query.dto';
import { HttpException } from '../exceptions/http-exception.exception';
import { StatusResponse } from '../common/status-response.common';

export class StockService {
    private logger = new Logger('StockService');

    async getAllStocks(queryDto: StockQueryDto = {}) {

        const {
            page = 1,
            limit = 10,
            search,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = queryDto;

        // Build filter object
        const filter: any = { isDelete: false };

        // Add search filter
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        // Add status filter
        if (status !== undefined) {
            filter.status = status;
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query with pagination
        const [stocks, total] = await Promise.all([
            Stock.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Stock.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: stocks,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage
            }
        };

    }

    async getStockById(id: string) {

        const stock = await Stock.findOne({ _id: id, isDelete: false });

        if (!stock) {

            throw new HttpException({
                status: 404,
                error_code: StatusResponse.STOCK_NOT_FOUND,
                message: 'Stock Not Found'
            });
        }

        return stock;
    }

    async createStock(createStockDto: CreateStockDto) {

        const { name, stock, reorderLevel, status } = createStockDto;

        // Check if stock name already exists
        const existingStock = await Stock.findOne({
            name: name.trim(),
            isDelete: false
        });

        if (existingStock) {

            throw new HttpException({
                status: 400,
                error_code: StatusResponse.STOCK_NAME_ALREADY_EXISTS,
                message: 'Stock name already exists'
            });
        }

        // Auto-calculate status based on stock level
        let calculatedStatus = status;
        if (calculatedStatus === undefined) {
            if (stock === 0) {
                calculatedStatus = StockStatusEnum.OUT_OF_STOCK;
            } else if (stock <= reorderLevel) {
                calculatedStatus = StockStatusEnum.LOW_STOCK;
            } else {
                calculatedStatus = StockStatusEnum.NORMAL;
            }
        }
        const newStock = new Stock({
            name: name.trim(),
            stock,
            reorderLevel,
            status: calculatedStatus,
        });

        await newStock.save();

        this.logger.verbose(`Stock created: ${newStock.name}`);

        return newStock;

    }

    async updateStock(id: string, updateStockDto: UpdateStockDto) {

        const { name, stock, reorderLevel, status } = updateStockDto;

        const stockDoc = await Stock.findOne({ _id: id, isDelete: false });

        if (!stockDoc) {
            throw new HttpException({
                status: 404,
                error_code: StatusResponse.STOCK_NOT_FOUND,
                message: 'Stock Not Found'
            });
        }

        // Check if new name already exists (if name is being updated)
        if (name && name.trim() !== stockDoc.name) {
            const existingStock = await Stock.findOne({
                name: name.trim(),
                _id: { $ne: id },
                isDelete: false
            });

            if (existingStock) {
                throw new HttpException({
                    status: 400,
                    error_code: StatusResponse.STOCK_NAME_ALREADY_EXISTS,
                    message: 'Stock Name Already Exists'
                });
            }
        }

        // Update fields
        if (name !== undefined) stockDoc.name = name.trim();
        if (stock !== undefined) stockDoc.stock = stock;
        if (reorderLevel !== undefined) stockDoc.reorderLevel = reorderLevel;

        // Auto-calculate status if not explicitly provided
        if (status !== undefined) {
            stockDoc.status = status;
        } else if (stock !== undefined || reorderLevel !== undefined) {
            // Recalculate status based on new stock level
            const currentStock = stock !== undefined ? stock : stockDoc.stock;
            const currentReorderLevel = reorderLevel !== undefined ? reorderLevel : stockDoc.reorderLevel;

            if (currentStock === 0) {
                stockDoc.status = StockStatusEnum.OUT_OF_STOCK;
            } else if (currentStock <= currentReorderLevel) {
                stockDoc.status = StockStatusEnum.LOW_STOCK;
            } else {
                stockDoc.status = StockStatusEnum.NORMAL;
            }
        }

        await stockDoc.save();

        this.logger.verbose(`Stock updated: ${stockDoc.name}`);

        return stockDoc;

    }

    async deleteStock(id: string) {

        const stock = await Stock.findOne({ _id: id, isDelete: false });

        if (!stock) {
            throw new HttpException({
                status: 404,
                error_code: StatusResponse.STOCK_NOT_FOUND,
                message: 'Stock Not Found'
            });
        }

        // Soft delete
        stock.isDelete = true;
        await stock.save();

        this.logger.verbose(`Stock deleted: ${stock.name}`);

        return true;

    }

    async getStocksByStatus(status: StockStatusEnum) {

        const stocks = await Stock.find({
            status,
            isDelete: false
        }).sort({ createdAt: -1 });

        return stocks;

    }

    async getLowStockItems() {

        const stocks = await Stock.find({
            isDelete: false,
            $expr: { $lte: ['$stock', '$reorderLevel'] }
        }).sort({ stock: 1 });

        return stocks;

    }

}
