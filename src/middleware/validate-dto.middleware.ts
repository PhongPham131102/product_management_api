import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dtoObj = plainToInstance(dtoClass, req.body);
        const errors = await validate(dtoObj);

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.map(err => ({
                    property: err.property,
                    constraints: err.constraints,
                })),
            });
        }

        req.body = dtoObj; // gán lại body thành instance DTO
        next();
    };
}
