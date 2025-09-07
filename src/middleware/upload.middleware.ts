import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { StatusResponse } from '../common/status-response.common';

// Configure storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/products/');
    },
    filename: (_req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Middleware for single file upload (optional)
export const uploadSingle = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        status: StatusResponse.FAIL,
                        message: 'File size too large. Maximum size is 5MB.'
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        status: StatusResponse.FAIL,
                        message: `Unexpected field name. Expected: ${fieldName}`
                    });
                }
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: err.message
                });
            }
            return next();
        });
    };
};

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
    return (req: Request, res: Response, next: NextFunction) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        status: StatusResponse.FAIL,
                        message: 'File size too large. Maximum size is 5MB.'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        status: StatusResponse.FAIL,
                        message: `Too many files. Maximum ${maxCount} files allowed.`
                    });
                }
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    status: StatusResponse.FAIL,
                    message: err.message
                });
            }
            return next();
        });
    };
};

// Helper function to get file URL
export const getFileUrl = (req: Request, filename: string): string => {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/products/${filename}`;
};
