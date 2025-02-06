export interface SuccessResponse<T> {
    status: 'success';
    message: string;
    data: T | null;
}

export interface ErrorResponse {
    status: 'error';
    message: string;
    error: {
        type: string;
        details?: string | ZodError;
    };
}

export const createSuccessResponse = <T>(
    message: string,
    data: T | null = null
): SuccessResponse<T> => ({
    status: 'success',
    message,
    data
});

export interface ZodError {
    _errors: string[];
}

export const createErrorResponse = (
    message: string,
    type = 'APIError',
    details?: string | ZodError
): ErrorResponse => ({
    status: 'error',
    message,
    error: {
        type,
        details
    }
});
