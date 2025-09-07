import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from "class-validator";
import { Expose } from "class-transformer";

export class CreateCategoryDto {
    @Expose()
    @IsString({ message: 'Category name must be a string' })
    @IsNotEmpty({ message: 'Category name is required' })
    @MinLength(3, { message: 'Category name must be at least 3 characters long' })
    @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
    name!: string;

    @Expose()
    @IsOptional()
    @IsString({ message: 'Category description must be a string' })
    @MaxLength(500, { message: 'Category description cannot exceed 500 characters' })
    description?: string;
}
