


import { Request, Response, NextFunction } from "express";
import { HttpException } from "../exceptions/http-exception.exception";
import { StatusResponse } from "../common/status-response.common";


export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpException) {
    return res.status(err.status).json({
      status: err.status,
      error_code: err.error_code || StatusResponse.INTERNAL_SERVER_ERROR,
      message: err.message,
      details: err.details || null,
      timestamp: new Date().toISOString(),
    });
  }

  // fallback nếu không phải HttpException
  return res.status(500).json({
    status: 500,
    error_code: StatusResponse.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong",
    timestamp: new Date().toISOString(),
  });
}
