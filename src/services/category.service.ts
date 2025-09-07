import { Category } from '../models/category.model';
import { Logger } from '../utils/logger.util';
import { CreateCategoryDto } from '../dto/categories/create-category.dto';
import { UpdateCategoryDto } from '../dto/categories/update-category.dto';
import { CategoryQueryDto } from '../dto/categories/category-query.dto';
import { HttpException } from '../exceptions/http-exception.exception';
import { StatusResponse } from '../common/status-response.common';

export class CategoryService {
    private logger = new Logger('CategoryService');

    async getAllCategories(queryDto: CategoryQueryDto = {}) {

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
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query with pagination
        const [categories, total] = await Promise.all([
            Category.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Category.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: categories,
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

    async getCategoryById(id: string) {

        const category = await Category.findOne({ _id: id, isDelete: false });

        if (!category) {

            throw new HttpException({
                status: 404,
                error_code: StatusResponse.CATEGORY_NOT_FOUND,
                message: 'Category Not Found'
            });
        }

        return category;
    }

    async createCategory(createCategoryDto: CreateCategoryDto) {

        const { name, description } = createCategoryDto;

        // Check if category name already exists
        const existingCategory = await Category.findOne({
            name: name.trim(),
            isDelete: false
        });

        if (existingCategory) {

            throw new HttpException({
                status: 400,
                error_code: StatusResponse.CATEGORY_NAME_ALREADY_EXISTS,
                message: 'Category name already exists'
            });
        }

        const newCategory = new Category({
            name: name.trim(),
            description: description?.trim() || '',
        });

        await newCategory.save();

        this.logger.verbose(`Category created: ${newCategory.name}`);

        return newCategory;

    }

    async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {

        const { name, description } = updateCategoryDto;

        const categoryDoc = await Category.findOne({ _id: id, isDelete: false });

        if (!categoryDoc) {
            throw new HttpException({
                status: 404,
                error_code: StatusResponse.CATEGORY_NOT_FOUND,
                message: 'Category Not Found'
            });
        }

        // Check if new name already exists (if name is being updated)
        if (name && name.trim() !== categoryDoc.name) {
            const existingCategory = await Category.findOne({
                name: name.trim(),
                _id: { $ne: id },
                isDelete: false
            });

            if (existingCategory) {
                throw new HttpException({
                    status: 400,
                    error_code: StatusResponse.CATEGORY_NAME_ALREADY_EXISTS,
                    message: 'Category Name Already Exists'
                });
            }
        }

        // Update fields
        if (name !== undefined) categoryDoc.name = name.trim();
        if (description !== undefined) categoryDoc.description = description.trim() || '';

        await categoryDoc.save();

        this.logger.verbose(`Category updated: ${categoryDoc.name}`);

        return categoryDoc;

    }

    async deleteCategory(id: string) {

        const category = await Category.findOne({ _id: id, isDelete: false });

        if (!category) {
            throw new HttpException({
                status: 404,
                error_code: StatusResponse.CATEGORY_NOT_FOUND,
                message: 'Category Not Found'
            });
        }

        // Soft delete
        category.isDelete = true;
        await category.save();

        this.logger.verbose(`Category deleted: ${category.name}`);

        return true;

    }

    async getCategoriesByName(name: string) {

        const categories = await Category.find({
            name: { $regex: name, $options: 'i' },
            isDelete: false
        }).sort({ name: 1 });

        return categories;

    }
}
