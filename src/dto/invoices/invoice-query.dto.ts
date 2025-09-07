import { Expose, Transform } from "class-transformer";
import { IsIn, IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class InvoiceQueryDto {
    @Expose()
    @IsOptional()
    @IsNumber({}, { message: 'Page must be a number' })
    @Min(1)
    @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
    page?: number;

    @Expose()
    @IsOptional()
    @IsNumber({}, { message: 'Limit must be a number' })
    @Min(1)
    @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
    limit?: number;

    @Expose()
    @IsOptional()
    @IsMongoId({ message: 'User must be a valid MongoDB ObjectId' })
    user?: string;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsIn([0, 1, 2])
    @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
    paymentStatus?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsIn([0, 1, 2, 3, 4])
    @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
    orderStatus?: number;

    @Expose()
    @IsOptional()
    @IsString()
    sortBy?: string;

    @Expose()
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}


