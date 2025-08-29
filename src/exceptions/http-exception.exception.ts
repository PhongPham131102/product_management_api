import { StatusResponse } from "../common/status-response.common";

export class HttpException extends Error {
    status: number;
    error_code: string;
    details?: any;

    constructor({ status, message, error_code, details }: { status: number, message: string, error_code: string, details?: any }) {
        super(message);
        this.status = status;
        this.error_code = error_code || StatusResponse.INTERNAL_SERVER_ERROR;
        this.details = details;
    }
}
