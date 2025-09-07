import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";
import { Expose } from "class-transformer";

export class CreateStockDto {
    @Expose()
    @IsString({ message: 'Stock name must be a string' })
    @IsNotEmpty({ message: 'Stock name is required' })
    @MinLength(2, { message: 'Stock name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Stock name cannot exceed 100 characters' })
    name!: string;
}

