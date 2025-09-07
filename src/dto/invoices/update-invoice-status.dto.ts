import { Expose, Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional } from "class-validator";

export class UpdateInvoiceStatusDto {
    @Expose()
    @IsOptional()
    @IsNumber()
    @IsIn([0, 1, 2])
    @Transform(({ value }) => Number(value))
    paymentStatus?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsIn([0, 1, 2, 3, 4])
    @Transform(({ value }) => Number(value))
    orderStatus?: number;
}


