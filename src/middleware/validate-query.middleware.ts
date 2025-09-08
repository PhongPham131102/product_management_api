import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateQuery(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const dtoObj: any = plainToInstance(dtoClass, req.query || {});
            const errors = await validate(dtoObj);

            if (errors.length > 0) {
                const validationErrors = errors.map(err => ({
                    field: err.property,
                    message: Object.values(err.constraints || {})[0] as string,
                    value: err.value
                }));

                return res.status(400).json({
                    statusCode: 400,
                    message: "Query validation failed",
                    details: validationErrors
                });
            }
            next();
        } catch (error) {
            console.error('Query validation error:', error);
            return res.status(400).json({
                message: "Invalid query parameters format",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
