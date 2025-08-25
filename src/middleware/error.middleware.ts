import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status = 500, message = "Internal Server Error", ...rest } = err;
  res.status(status).json({ message, ...rest });
};
