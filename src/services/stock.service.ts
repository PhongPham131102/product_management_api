import { Stock } from '../models/stock.model';
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
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = queryDto;

        // Build filter object
        const filter: any = { isDelete: false };

        // Add search filter
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
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

        const { name } = createStockDto;

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


        const newStock = new Stock({
            name: name.trim(),
        });

        await newStock.save();

        return newStock;

    }

    async updateStock(id: string, updateStockDto: UpdateStockDto) {

        const { name } = updateStockDto;

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

        if (name !== undefined) stockDoc.name = name.trim();

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

}
