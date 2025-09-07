import { IsOptional, IsString, MinLength, MaxLength } from "class-validator";

export class UpdateCategoryDto {
    @IsOptional()
    @IsString({ message: 'Category name must be a string' })
    @MinLength(3, { message: 'Category name must be at least 3 characters long' })
    @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Category description must be a string' })
    @MaxLength(500, { message: 'Category description cannot exceed 500 characters' })
    description?: string;
}
