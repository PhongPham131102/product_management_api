import { IsNotEmpty, IsString, IsArray, IsEnum } from "class-validator";
import { ActionEnum, SubjectEnum } from "../../models/permission.model";

export class CreatePermissionDto {
    @IsString({ message: 'Role ID must be a string' })
    @IsNotEmpty({ message: 'Role ID is required' })
    roleId!: string;

    @IsArray({ message: 'Actions must be an array' })
    @IsEnum(ActionEnum, { each: true, message: 'Each action must be a valid action type' })
    action!: ActionEnum[];

    @IsString({ message: 'Subject must be a string' })
    @IsEnum(SubjectEnum, { message: 'Subject must be a valid subject type' })
    subject!: SubjectEnum;
}

export class UpdatePermissionDto {
    @IsArray({ message: 'Actions must be an array' })
    @IsEnum(ActionEnum, { each: true, message: 'Each action must be a valid action type' })
    action!: ActionEnum[];
}
