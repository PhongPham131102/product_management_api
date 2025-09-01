import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { ActionEnum, SubjectEnum } from '../../models/permission.model';

@ValidatorConstraint({ name: 'isValidEnumValue', async: false })
export class IsValidEnumValue implements ValidatorConstraintInterface {
  validate(value: any) {
    try {
      const allKeysInEnum = Object.keys(value).every((key) =>
        Object.values(SubjectEnum).includes(key as any),
      );
      const allValuesInEnum = Object.values(value).every((iterator) =>
        (iterator as any).every((action: any) =>
          Object.values(ActionEnum).includes(action),
        ),
      );
      return allKeysInEnum && allValuesInEnum;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} key must be a valid value from ${Object.values(
      SubjectEnum,
    ).join(', ')}. and ${
      args.property
    } value must be a valid value from ${Object.values(ActionEnum).join(
      ', ',
    )}.`;
  }
}

export function IsEnumValid(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isEnumValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: IsValidEnumValue,
    });
  };
}

export class CreatePermissionRoleDto {
  @IsString({ message: 'Role name must be a string' })
  @IsNotEmpty({ message: 'Role name is required' })
  role!: string;

  @IsEnumValid()
  permission!: Record<SubjectEnum, ActionEnum[]>;
}
