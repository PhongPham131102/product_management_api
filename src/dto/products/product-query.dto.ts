import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, IsMongoId } from "class-validator";
import { Type } from "class-transformer";
import { ProductStatusEnum } from "../../models/product.model";

export class ProductQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Page must be a number' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Limit must be a number' })
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    limit?: number = 10;

    @IsOptional()
    @IsString({ message: 'Search must be a string' })
    search?: string;

    @IsOptional()
    @IsString({ message: 'Category ID must be a string' })
    @IsMongoId({ message: 'Category must be a valid MongoDB ObjectId' })
    category?: string;

    @IsOptional()
    @IsString({ message: 'Stock ID must be a string' })
    @IsMongoId({ message: 'Stock must be a valid MongoDB ObjectId' })
    stock?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Min price must be a number' })
    @Min(0, { message: 'Min price cannot be negative' })
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Max price must be a number' })
    @Min(0, { message: 'Max price cannot be negative' })
    maxPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsEnum(ProductStatusEnum, { message: 'Status must be 0 (In Stock), 1 (Low Stock), or 2 (Out of Stock)' })
    status?: ProductStatusEnum;

    @IsOptional()
    @IsString({ message: 'Sort field must be a string' })
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsString({ message: 'Sort order must be a string' })
    sortOrder?: 'asc' | 'desc' = 'desc';
}
