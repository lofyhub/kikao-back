interface SuccessResponse<T = null> {
    status: 'success';
    message: string;
    data: T | null;
}

interface ErrorResponse {
    status: 'error';
    message: string;
    error: {
        type: string;
        details?: string | ZodError;
    };
}

type ApiResponse<T = null> = SuccessResponse<T> | ErrorResponse;

export const createSuccessResponse = <T = null>(
    message: string,
    data: T | null = null
): ApiResponse<T> => ({
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
): ApiResponse => ({
    status: 'error',
    message,
    error: {
        type,
        details
    }
});
