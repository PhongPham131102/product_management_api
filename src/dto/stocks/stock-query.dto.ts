import { IsOptional, IsString, IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class StockQueryDto {
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
    @IsString({ message: 'Sort field must be a string' })
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsString({ message: 'Sort order must be a string' })
    sortOrder?: 'asc' | 'desc' = 'desc';
}
