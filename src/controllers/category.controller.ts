import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { Logger } from '../utils/logger.util';
import { StatusResponse } from '../common/status-response.common';
import { CreateCategoryDto } from '../dto/categories/create-category.dto';
import { UpdateCategoryDto } from '../dto/categories/update-category.dto';
import { CategoryQueryDto } from '../dto/categories/category-query.dto';
import { HttpException } from '../exceptions/http-exception.exception';

export class CategoryController {
    private logger = new Logger('CategoryController');
    private categoryService = new CategoryService();

    async getAllCategories(req: Request, res: Response) {
        try {
            const queryDto: CategoryQueryDto = req.query as any;
            const result = await this.categoryService.getAllCategories(queryDto);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Categories retrieved successfully',
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

    async getCategoryById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Category ID is required'
                });
            }

            const category = await this.categoryService.getCategoryById(id);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Category retrieved successfully',
                data: category
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async createCategory(req: Request, res: Response) {
        try {
            const createCategoryDto: CreateCategoryDto = req.body;

            const category = await this.categoryService.createCategory(createCategoryDto);

            return res.status(201).json({
                status: StatusResponse.SUCCESS,
                message: 'Category created successfully',
                data: category
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async updateCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateCategoryDto: UpdateCategoryDto = req.body;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Category ID is required'
                });
            }

            const category = await this.categoryService.updateCategory(id, updateCategoryDto);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Category updated successfully',
                data: category
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Category ID is required'
                });
            }

            await this.categoryService.deleteCategory(id);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Category deleted successfully'
            });
        } catch (error: any) {
            if (error instanceof HttpException) throw error
            return res.status(error.status || 500).json({
                status: StatusResponse.FAIL,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getCategoriesByName(req: Request, res: Response) {
        try {
            const { name } = req.query;

            if (!name || typeof name !== 'string') {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: 'Category name is required'
                });
            }

            const categories = await this.categoryService.getCategoriesByName(name);

            return res.json({
                status: StatusResponse.SUCCESS,
                message: 'Categories retrieved successfully',
                data: categories
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
