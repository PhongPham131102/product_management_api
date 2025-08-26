import { IsNotEmpty, IsString } from "class-validator";
import { Expose } from "class-transformer";

export class LoginDto {
    @Expose()
    @IsString({ message: 'Username must be a string' })
    @IsNotEmpty({ message: 'Username is required' })
    username!: string;

    @Expose()
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;
}
