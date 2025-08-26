import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";

export class CreateRoleDto {
    @IsString({ message: 'Role name must be a string' })
    @IsNotEmpty({ message: 'Role name is required' })
    @MinLength(3, { message: 'Role name must be at least 3 characters long' })
    @MaxLength(50, { message: 'Role name cannot exceed 50 characters' })
    name!: string;
}

export class UpdateRoleDto {
    @IsString({ message: 'Role name must be a string' })
    @IsNotEmpty({ message: 'Role name is required' })
    @MinLength(3, { message: 'Role name must be at least 3 characters long' })
    @MaxLength(50, { message: 'Role name cannot exceed 50 characters' })
    name!: string;
}
