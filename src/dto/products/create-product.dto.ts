import { IsNotEmpty, IsNumber, IsString, Min, MinLength, MaxLength, IsOptional, IsArray, IsMongoId, IsEnum } from "class-validator";
import { Expose, Transform } from "class-transformer";
import { ProductStatusEnum } from "../../models/product.model";

export class CreateProductDto {
    @Expose()
    @IsString({ message: 'Product name must be a string' })
    @IsNotEmpty({ message: 'Product name is required' })
    @MinLength(2, { message: 'Product name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Product name cannot exceed 100 characters' })
    name!: string;

    @Expose()
    @IsString({ message: 'Product SKU must be a string' })
    @IsNotEmpty({ message: 'Product SKU is required' })
    @MinLength(3, { message: 'Product SKU must be at least 3 characters long' })
    @MaxLength(50, { message: 'Product SKU cannot exceed 50 characters' })
    sku!: string;

    @Expose()
    @IsString({ message: 'Product unit must be a string' })
    @IsNotEmpty({ message: 'Product unit is required' })
    @MinLength(1, { message: 'Product unit must be at least 1 character long' })
    @MaxLength(20, { message: 'Product unit cannot exceed 20 characters' })
    unit!: string;

    @Expose()
    @IsString({ message: 'Product description must be a string' })
    @IsNotEmpty({ message: 'Product description is required' })
    @MinLength(10, { message: 'Product description must be at least 10 characters long' })
    @MaxLength(1000, { message: 'Product description cannot exceed 1000 characters' })
    description!: string;

    @Expose()
    @IsNumber({}, { message: 'Product price must be a number' })
    @IsNotEmpty({ message: 'Product price is required' })
    @Min(0, { message: 'Product price cannot be negative' })
    @Transform(({ value }) => Number(value))
    price!: number;

    @Expose()
    @IsNumber({}, { message: 'Product original price must be a number' })
    @IsNotEmpty({ message: 'Product original price is required' })
    @Min(0, { message: 'Product original price cannot be negative' })
    @Transform(({ value }) => Number(value))
    originalPrice!: number;

    @Expose()
    @IsNumber({}, { message: 'Product quantity must be a number' })
    @IsNotEmpty({ message: 'Product quantity is required' })
    @Min(0, { message: 'Product quantity cannot be negative' })
    @Transform(({ value }) => Number(value))
    quantity!: number;

    @Expose()
    @IsNumber({}, { message: 'Product reorder level must be a number' })
    @IsNotEmpty({ message: 'Product reorder level is required' })
    @Min(0, { message: 'Product reorder level cannot be negative' })
    @Transform(({ value }) => Number(value))
    reorderLevel!: number;

    @Expose()
    @IsOptional()
    @IsEnum(ProductStatusEnum, { message: 'Product status must be 0 (In Stock), 1 (Low Stock), or 2 (Out of Stock)' })
    @Transform(({ value }) => value !== undefined ? Number(value) : value)
    status?: ProductStatusEnum;

    @Expose()
    @IsNotEmpty({ message: 'At least one category is required' })
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
    categories!: string[];

    @Expose()
    @IsString({ message: 'Stock ID must be a string' })
    @IsMongoId({ message: 'Stock must be a valid MongoDB ObjectId' })
    @IsNotEmpty({ message: 'Stock reference is required' })
    stock!: string;

    @Expose()
    @IsOptional()
    @IsString({ message: 'Image URL must be a string' })
    @MaxLength(500, { message: 'Image URL cannot exceed 500 characters' })
    imageUrl?: string;
}
