import { Request, Response, NextFunction } from 'express';

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
        details?: string;
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

export const createErrorResponse = (
    message: string,
    type = 'APIError',
    details?: string
): ApiResponse => ({
    status: 'error',
    message,
    error: {
        type,
        details
    }
});
