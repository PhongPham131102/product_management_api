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
  "INVALID_TOKEN",
  "ACCESS_TOKEN_REQUIRED",
  "USER_NOT_FOUND",
  "ROLE_BY_ID_NOT_FOUND",
  "ROLE_ALREADY_EXISTS",
  "ROLE_NAME_ALREADY_EXISTS",
  "INTERNAL_SERVER_ERROR"
);