import { Expose } from "class-transformer";
import { IsEmail, IsMongoId, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
    @Expose()
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    name?: string;

    @Expose()
    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email?: string;

    @Expose()
    @IsOptional()
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    username?: string;

    @Expose()
    @IsOptional()
    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password?: string;

    @Expose()
    @IsOptional()
    @IsMongoId({ message: 'Role must be a valid MongoDB ObjectId' })
    role?: string;
}


