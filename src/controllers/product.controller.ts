import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { StatusResponse } from '../common/status-response.common';
import { CreateProductDto } from '../dto/products/create-product.dto';
import { UpdateProductDto } from '../dto/products/update-product.dto';
import { ProductQueryDto } from '../dto/products/product-query.dto';
import { HttpException } from '../exceptions/http-exception.exception';
import { getFileUrl } from '../middleware/upload.middleware';

export class ProductController {
    private productService = new ProductService();

    async getAllProducts(req: Request, res: Response) {
        try {
            const queryDto: ProductQueryDto = req.query as any;
            const result = await this.productService.getAllProducts(queryDto);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Products retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Product ID is required'
                });
            }

            const product = await this.productService.getProductById(id);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Product retrieved successfully',
                data: product
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async createProduct(req: Request, res: Response) {
        try {
            const createProductDto: CreateProductDto = req.body;

            // Handle file upload if image is provided
            if (req.file) {
                createProductDto.imageUrl = getFileUrl(req, req.file.filename);
            } else {
                // Set empty string if no image provided
                createProductDto.imageUrl = '';
            }

            const product = await this.productService.createProduct(createProductDto);

            return res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'Product created successfully',
                data: product
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateProductDto: UpdateProductDto = req.body;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Product ID is required'
                });
            }

            // Handle file upload if new image is provided
            if (req.file) {
                updateProductDto.imageUrl = getFileUrl(req, req.file.filename);
            }
            // If no new image provided, keep existing imageUrl (don't update it)

            const product = await this.productService.updateProduct(id, updateProductDto);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Product updated successfully',
                data: product
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Product ID is required'
                });
            }

            await this.productService.deleteProduct(id);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Product deleted successfully'
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getProductsByCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;

            if (!categoryId) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Category ID is required'
                });
            }

            const products = await this.productService.getProductsByCategory(categoryId);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Products retrieved successfully',
                data: products
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getProductsByStock(req: Request, res: Response) {
        try {
            const { stockId } = req.params;

            if (!stockId) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Stock ID is required'
                });
            }

            const products = await this.productService.getProductsByStock(stockId);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Products retrieved successfully',
                data: products
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getProductsByPriceRange(req: Request, res: Response) {
        try {
            const { minPrice, maxPrice } = req.query;

            if (!minPrice || !maxPrice || isNaN(Number(minPrice)) || isNaN(Number(maxPrice))) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Valid minPrice and maxPrice are required'
                });
            }

            const products = await this.productService.getProductsByPriceRange(
                Number(minPrice),
                Number(maxPrice)
            );

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Products retrieved successfully',
                data: products
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
