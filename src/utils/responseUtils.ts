import { ErrorCodes } from '../errors';
export interface SuccessResponse<T> {
    status: StatusEnum.Success;
    message: string;
    data: T | null;
}

export interface ErrorResponse {
    status: StatusEnum.Error;
    message: string;
    error: {
        type: ErrorCodes;
        details?: string | ZodError;
    };
}
export enum StatusEnum {
    Success = 'success',
    Error = 'error'
}

export const createSuccessResponse = <T>(
    message: string,
    data: T | null = null
): SuccessResponse<T> => ({
    status: StatusEnum.Success,
    message,
    data
});

export interface ZodError {
    _errors: string[];
}

export const createErrorResponse = (
    message: string,
    type = ErrorCodes.APIError,
    details?: string | ZodError
): ErrorResponse => ({
    status: StatusEnum.Error,
    message,
    error: {
        type,
        details
    }
});
