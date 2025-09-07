import { IsOptional, IsString, MinLength, MaxLength } from "class-validator";

export class UpdateStockDto {
    @IsOptional()
    @IsString({ message: 'Stock name must be a string' })
    @MinLength(2, { message: 'Stock name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Stock name cannot exceed 100 characters' })
    name?: string;
}