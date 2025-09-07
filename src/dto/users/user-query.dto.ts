import { Expose, Transform } from "class-transformer";
import { IsIn, IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UserQueryDto {
    @Expose()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
    page?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
    limit?: number;

    @Expose()
    @IsOptional()
    @IsString()
    search?: string;

    @Expose()
    @IsOptional()
    @IsMongoId({ message: 'Role must be a valid MongoDB ObjectId' })
    role?: string;

    @Expose()
    @IsOptional()
    @IsString()
    sortBy?: string;

    @Expose()
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}


