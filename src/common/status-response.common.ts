function toEnum<T extends string>(...values: T[]) {
  return values.reduce(
    (acc, value) => {
      acc[value] = value.toLowerCase();
      return acc;
    },
    {} as Record<T, string>,
  );
}

export const StatusResponse = toEnum(
  'SUCCESS',
  'FAIL',
  'FORBIDDEN',
  'NOTFOUND',
  'EXISTS_USERNAME',
  'EXISTS_EMAIL',
  'USERNAME_OR_PASSWORD_IS_NOT_CORRECT',
  'NOT_EXISTS_ROLE',
  'TYPE_ERROR',
);