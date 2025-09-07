import { IsNotEmpty, IsNumber, IsString, Min, MinLength, MaxLength, IsOptional, IsEnum } from "class-validator";
import { Expose, Transform } from "class-transformer";
import { StockStatusEnum } from "../../models/stock.model";

export class CreateStockDto {
    @Expose()
    @IsString({ message: 'Stock name must be a string' })
    @IsNotEmpty({ message: 'Stock name is required' })
    @MinLength(2, { message: 'Stock name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Stock name cannot exceed 100 characters' })
    name!: string;

    @Expose()
    @IsNumber({}, { message: 'Stock quantity must be a number' })
    @IsNotEmpty({ message: 'Stock quantity is required' })
    @Min(0, { message: 'Stock quantity cannot be negative' })
    @Transform(({ value }) => Number(value))
    stock!: number;

    @Expose()
    @IsNumber({}, { message: 'Reorder level must be a number' })
    @IsNotEmpty({ message: 'Reorder level is required' })
    @Min(0, { message: 'Reorder level cannot be negative' })
    @Transform(({ value }) => Number(value))
    reorderLevel!: number;

    @Expose()
    @IsOptional()
    @IsEnum(StockStatusEnum, { message: 'Status must be a valid stock status' })
    @Transform(({ value }) => value !== undefined ? Number(value) : value)
    status?: StockStatusEnum;
}

