import { IsOptional, IsString, MinLength, MaxLength, IsNumber, Min, IsArray, IsMongoId, IsEnum } from "class-validator";
import { Transform } from "class-transformer";
import { ProductStatusEnum } from "../../models/product.model";

export class UpdateProductDto {
    @IsOptional()
    @IsString({ message: 'Product name must be a string' })
    @MinLength(2, { message: 'Product name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Product name cannot exceed 100 characters' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Product SKU must be a string' })
    @MinLength(3, { message: 'Product SKU must be at least 3 characters long' })
    @MaxLength(50, { message: 'Product SKU cannot exceed 50 characters' })
    sku?: string;

    @IsOptional()
    @IsString({ message: 'Product unit must be a string' })
    @MinLength(1, { message: 'Product unit must be at least 1 character long' })
    @MaxLength(20, { message: 'Product unit cannot exceed 20 characters' })
    unit?: string;

    @IsOptional()
    @IsString({ message: 'Product description must be a string' })
    @MinLength(10, { message: 'Product description must be at least 10 characters long' })
    @MaxLength(1000, { message: 'Product description cannot exceed 1000 characters' })
    description?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Product price must be a number' })
    @Min(0, { message: 'Product price cannot be negative' })
    @Transform(({ value }) => Number(value))
    price?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Product original price must be a number' })
    @Min(0, { message: 'Product original price cannot be negative' })
    @Transform(({ value }) => Number(value))
    originalPrice?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Product quantity must be a number' })
    @Min(0, { message: 'Product quantity cannot be negative' })
    @Transform(({ value }) => Number(value))
    quantity?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Product reorder level must be a number' })
    @Min(0, { message: 'Product reorder level cannot be negative' })
    @Transform(({ value }) => Number(value))
    reorderLevel?: number;

    @IsOptional()
    @IsEnum(ProductStatusEnum, { message: 'Product status must be 0 (In Stock), 1 (Low Stock), or 2 (Out of Stock)' })
    @Transform(({ value }) => value !== undefined ? Number(value) : value)
    status?: ProductStatusEnum;

    @IsOptional()
    @Transform(({ value }) => {
        // Handle both array and JSON string from FormData
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [value]; // Single category ID as string
            }
        }
        return value;
    })
    @IsArray({ message: 'Categories must be an array' })
    @IsMongoId({ each: true, message: 'Each category must be a valid MongoDB ObjectId' })
    categories?: string[];

    @IsOptional()
    @IsString({ message: 'Stock ID must be a string' })
    @IsMongoId({ message: 'Stock must be a valid MongoDB ObjectId' })
    stock?: string;

    @IsOptional()
    @IsString({ message: 'Image URL must be a string' })
    @MaxLength(500, { message: 'Image URL cannot exceed 500 characters' })
    imageUrl?: string;
}
