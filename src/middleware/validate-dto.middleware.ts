import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Sử dụng plainToInstance với cấu hình đơn giản
            const dtoObj = plainToInstance(dtoClass, req.body || {});
            const errors = await validate(dtoObj);

            if (errors.length > 0) {
                const validationErrors = errors.map(err => ({
                    field: err.property,
                    message: Object.values(err.constraints || {})[0] as string,
                    value: err.value
                }));

                return res.status(400).json({
                    statusCode: 400,
                    message: "Validation failed",
                    details: validationErrors
                });
            }

            req.body = dtoObj;
            next();
        } catch (error) {
            console.error('DTO validation error:', error);
            return res.status(400).json({
                message: "Invalid request data format",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
