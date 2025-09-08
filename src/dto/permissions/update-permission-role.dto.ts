import {
  IsString,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
  IsOptional,
} from 'class-validator';
import { ActionEnum, SubjectEnum } from '../../models/permission.model';

@ValidatorConstraint({ name: 'isValidPermissionObject', async: false })
export class IsValidPermissionObject implements ValidatorConstraintInterface {
  validate(value: any) {
    if (!value || typeof value !== 'object') {
      return false;
    }

    try {
      // Kiểm tra từng key (subject) và value (actions array)
      for (const [subject, actions] of Object.entries(value)) {
        // Kiểm tra subject có hợp lệ không
        if (!Object.values(SubjectEnum).includes(subject as SubjectEnum)) {
          return false;
        }

        // Kiểm tra actions có phải array không
        if (!Array.isArray(actions)) {
          return false;
        }

        // Kiểm tra từng action có hợp lệ không
        for (const action of actions) {
          if (!Object.values(ActionEnum).includes(action as ActionEnum)) {
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid permission object. Keys must be from: ${Object.values(SubjectEnum).join(', ')}. Values must be arrays of: ${Object.values(ActionEnum).join(', ')}.`;
  }
}

export function IsValidPermission(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isValidPermission',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: IsValidPermissionObject,
    });
  };
}

export class UpdatePermissionRoleDto {
  @IsString({ message: 'Role name must be a string' })
  @IsOptional({ message: 'Role name is optional' })
  role!: string;

  @IsValidPermission()
  permission!: Record<SubjectEnum, ActionEnum[]>;
}
