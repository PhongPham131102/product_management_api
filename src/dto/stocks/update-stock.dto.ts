import { IsOptional, IsString, MinLength, MaxLength, IsNumber, Min, IsEnum } from "class-validator";
import { StockStatusEnum } from "../../models/stock.model";
import { Transform } from "class-transformer";

export class UpdateStockDto {
    @IsOptional()
    @IsString({ message: 'Stock name must be a string' })
    @MinLength(2, { message: 'Stock name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Stock name cannot exceed 100 characters' })
    name?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Stock quantity must be a number' })
    @Min(0, { message: 'Stock quantity cannot be negative' })
    @Transform(({ value }) => Number(value))
    stock?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Reorder level must be a number' })
    @Min(0, { message: 'Reorder level cannot be negative' })
    @Transform(({ value }) => Number(value))
    reorderLevel?: number;

    @IsOptional()
    @IsEnum(StockStatusEnum, { message: 'Status must be a valid stock status' })
    @Transform(({ value }) => value !== undefined ? Number(value) : value)
    status?: StockStatusEnum;
}