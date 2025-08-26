import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional } from "class-validator";
import { Expose } from "class-transformer";

export class CreateUserDto {
    @Expose()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @Expose()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password!: string;

    @Expose()
    @IsString({ message: 'Username must be a string' })
    @IsNotEmpty({ message: 'Username is required' })
    username!: string;

    @Expose()
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name!: string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email?: string;
}
