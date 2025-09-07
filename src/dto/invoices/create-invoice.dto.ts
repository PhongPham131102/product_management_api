import { Expose, Transform, Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

class CreateInvoiceItemDto {
    @Expose()
    @IsMongoId({ message: 'Product must be a valid MongoDB ObjectId' })
    @IsNotEmpty({ message: 'Product is required' })
    product!: string;

    @Expose()
    @IsNumber({}, { message: 'Quantity must be a number' })
    @Min(1, { message: 'Quantity must be at least 1' })
    @Transform(({ value }) => Number(value))
    quantity!: number;
}

export class CreateInvoiceDto {
    @Expose()
    @IsMongoId({ message: 'Customer must be a valid MongoDB ObjectId' })
    @IsNotEmpty({ message: 'Customer is required' })
    customer!: string;

    @Expose()
    @Type(() => CreateInvoiceItemDto)
    @ValidateNested({ each: true })
    @IsArray({ message: 'Items must be an array' })
    @IsNotEmpty({ message: 'Items are required' })
    items!: CreateInvoiceItemDto[];

    @Expose()
    @IsOptional()
    @IsString({ message: 'Note must be a string' })
    note?: string;
}

export { CreateInvoiceItemDto };


