import { Product, ProductStatusEnum } from '../models/product.model';
import { Category } from '../models/category.model';
import { Stock } from '../models/stock.model';
import { Logger } from '../utils/logger.util';
import { CreateProductDto } from '../dto/products/create-product.dto';
import { UpdateProductDto } from '../dto/products/update-product.dto';
import { ProductQueryDto } from '../dto/products/product-query.dto';
import { HttpException } from '../exceptions/http-exception.exception';
import { StatusResponse } from '../common/status-response.common';
import { Types } from 'mongoose';

export class ProductService {
    private logger = new Logger('ProductService');

    // Helper method to calculate product status based on quantity and reorder level
    private calculateProductStatus(quantity: number, reorderLevel: number): ProductStatusEnum {
        if (quantity === 0) {
            return ProductStatusEnum.OUT_OF_STOCK;
        } else if (quantity <= reorderLevel) {
            return ProductStatusEnum.LOW_STOCK;
        } else {
            return ProductStatusEnum.IN_STOCK;
        }
    }

    async getAllProducts(queryDto: ProductQueryDto = {}) {

        const {
            page = 1,
            limit = 10,
            search,
            category,
            stock,
            minPrice,
            maxPrice,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = queryDto;

        // Build filter object
        const filter: any = { isDelete: false };

        // Add search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        // Add category filter
        if (category) {
            filter.categories = new Types.ObjectId(category);
        }

        // Add stock filter
        if (stock) {
            filter.stock = new Types.ObjectId(stock);
        }

        // Add price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = minPrice;
            if (maxPrice !== undefined) filter.price.$lte = maxPrice;
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

        // Execute query with pagination and populate
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('categories', 'name description')
                .populate('stock', 'name stock reorderLevel status')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: products,
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

    async getProductById(id: string) {

        const product = await Product.findOne({ _id: id, isDelete: false })
            .populate('categories', 'name description')
            .populate('stock', 'name stock reorderLevel status');

        if (!product) {

            throw new HttpException({
                status: 404,
                error_code: StatusResponse.PRODUCT_NOT_FOUND,
                message: 'Product Not Found'
            });
        }

        return product;
    }

    async createProduct(createProductDto: CreateProductDto) {

        const { name, sku, unit, description, price, originalPrice, quantity, reorderLevel, status, categories, stock, imageUrl } = createProductDto;

        // Check if product SKU already exists
        const existingProduct = await Product.findOne({
            sku: sku.trim(),
            isDelete: false
        });

        if (existingProduct) {

            throw new HttpException({
                status: 400,
                error_code: StatusResponse.PRODUCT_SKU_ALREADY_EXISTS,
                message: 'Product SKU already exists'
            });
        }

        // Validate categories exist
        const categoryObjects = await Category.find({
            _id: { $in: categories },
            isDelete: false
        });

        if (categoryObjects.length !== categories.length) {
            throw new HttpException({
                status: 400,
                error_code: StatusResponse.CATEGORY_NOT_FOUND,
                message: 'One or more categories not found'
            });
        }

        // Validate stock exists
        const stockObject = await Stock.findOne({
            _id: stock,
            isDelete: false
        });

        if (!stockObject) {
            throw new HttpException({
                status: 400,
                error_code: StatusResponse.STOCK_NOT_FOUND,
                message: 'Stock not found'
            });
        }

        // Calculate status automatically if not provided
        const calculatedStatus = status !== undefined ? status : this.calculateProductStatus(quantity, reorderLevel);

        const newProduct = new Product({
            name: name.trim(),
            sku: sku.trim(),
            unit: unit.trim(),
            description: description.trim(),
            price,
            originalPrice,
            quantity,
            reorderLevel,
            status: calculatedStatus,
            categories,
            stock,
            imageUrl: imageUrl || '',
        });

        await newProduct.save();

        // Populate the created product
        await newProduct.populate([
            { path: 'categories', select: 'name description' },
            { path: 'stock', select: 'name stock reorderLevel status' }
        ]);

        this.logger.verbose(`Product created: ${newProduct.name}`);

        return newProduct;

    }

    async updateProduct(id: string, updateProductDto: UpdateProductDto) {

        const { name, sku, unit, description, price, originalPrice, quantity, reorderLevel, status, categories, stock, imageUrl } = updateProductDto;

        const productDoc = await Product.findOne({ _id: id, isDelete: false });

        if (!productDoc) {
            throw new HttpException({
                status: 404,
                error_code: StatusResponse.PRODUCT_NOT_FOUND,
                message: 'Product Not Found'
            });
        }

        // Check if new SKU already exists (if SKU is being updated)
        if (sku && sku.trim() !== productDoc.sku) {
            const existingProduct = await Product.findOne({
                sku: sku.trim(),
                _id: { $ne: id },
                isDelete: false
            });

            if (existingProduct) {
                throw new HttpException({
                    status: 400,
                    error_code: StatusResponse.PRODUCT_SKU_ALREADY_EXISTS,
                    message: 'Product SKU Already Exists'
                });
            }
        }

        // Validate categories exist (if categories are being updated)
        if (categories && categories.length > 0) {
            const categoryObjects = await Category.find({
                _id: { $in: categories },
                isDelete: false
            });

            if (categoryObjects.length !== categories.length) {
                throw new HttpException({
                    status: 400,
                    error_code: StatusResponse.CATEGORY_NOT_FOUND,
                    message: 'One or more categories not found'
                });
            }
        }

        // Validate stock exists (if stock is being updated)
        if (stock) {
            const stockObject = await Stock.findOne({
                _id: stock,
                isDelete: false
            });

            if (!stockObject) {
                throw new HttpException({
                    status: 400,
                    error_code: StatusResponse.STOCK_NOT_FOUND,
                    message: 'Stock not found'
                });
            }
        }

        // Update fields
        if (name !== undefined) productDoc.name = name.trim();
        if (sku !== undefined) productDoc.sku = sku.trim();
        if (unit !== undefined) productDoc.unit = unit.trim();
        if (description !== undefined) productDoc.description = description.trim();
        if (price !== undefined) productDoc.price = price;
        if (originalPrice !== undefined) productDoc.originalPrice = originalPrice;
        if (quantity !== undefined) productDoc.quantity = quantity;
        if (reorderLevel !== undefined) productDoc.reorderLevel = reorderLevel;
        if (categories !== undefined) productDoc.categories = categories as any;
        if (stock !== undefined) productDoc.stock = stock as any;
        if (imageUrl !== undefined) productDoc.imageUrl = imageUrl;

        // Recalculate status if quantity or reorderLevel changed
        if (quantity !== undefined || reorderLevel !== undefined) {
            const finalQuantity = quantity !== undefined ? quantity : productDoc.quantity;
            const finalReorderLevel = reorderLevel !== undefined ? reorderLevel : productDoc.reorderLevel;
            productDoc.status = this.calculateProductStatus(finalQuantity, finalReorderLevel);
        } else if (status !== undefined) {
            productDoc.status = status;
        }

        await productDoc.save();

        // Populate the updated product
        await productDoc.populate([
            { path: 'categories', select: 'name description' },
            { path: 'stock', select: 'name stock reorderLevel status' }
        ]);

        this.logger.verbose(`Product updated: ${productDoc.name}`);

        return productDoc;

    }

    async deleteProduct(id: string) {

        const product = await Product.findOne({ _id: id, isDelete: false });

        if (!product) {
            throw new HttpException({
                status: 404,
                error_code: StatusResponse.PRODUCT_NOT_FOUND,
                message: 'Product Not Found'
            });
        }

        // Soft delete
        product.isDelete = true;
        await product.save();

        this.logger.verbose(`Product deleted: ${product.name}`);

        return true;

    }

    async getProductsByCategory(categoryId: string) {

        const products = await Product.find({
            categories: new Types.ObjectId(categoryId),
            isDelete: false
        })
            .populate('categories', 'name description')
            .populate('stock', 'name stock reorderLevel status')
            .sort({ createdAt: -1 });

        return products;

    }

    async getProductsByStock(stockId: string) {

        const products = await Product.find({
            stock: new Types.ObjectId(stockId),
            isDelete: false
        })
            .populate('categories', 'name description')
            .populate('stock', 'name stock reorderLevel status')
            .sort({ createdAt: -1 });

        return products;

    }

    async getProductsByPriceRange(minPrice: number, maxPrice: number) {

        const products = await Product.find({
            isDelete: false,
            price: { $gte: minPrice, $lte: maxPrice }
        })
            .populate('categories', 'name description')
            .populate('stock', 'name stock reorderLevel status')
            .sort({ price: 1 });

        return products;

    }
}
