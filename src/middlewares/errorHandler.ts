import { Request, Response, NextFunction } from 'express';
import {
    NotFoundError,
    UnauthorizedError,
    DeleteFailedError,
    GenericError,
    ErrorCodes,
    ValidationError
} from '../errors';
import { createErrorResponse } from '../utils/responseUtils';
import multer from 'multer';
import { PostgresError } from 'postgres';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): any {
    // TODO: Better way to log and trace these errors!
    console.error(err);

    if (err instanceof NotFoundError) {
        return res
            .status(404)
            .json(
                createErrorResponse(
                    err.message,
                    ErrorCodes.APIError,
                    err.detail
                )
            );
    } else if (err instanceof ValidationError) {
        return res
            .status(403)
            .json(
                createErrorResponse(
                    err.message,
                    ErrorCodes.VALIDError,
                    err.details
                )
            );
    } else if (err instanceof UnauthorizedError) {
        return res
            .status(401)
            .json(
                createErrorResponse(
                    err.message,
                    ErrorCodes.APIError,
                    err.details
                )
            );
    } else if (err instanceof DeleteFailedError) {
        return res
            .status(403)
            .json(
                createErrorResponse(
                    err.message,
                    ErrorCodes.APIError,
                    err.details
                )
            );
    } else if (err instanceof GenericError) {
        return res
            .status(403)
            .json(
                createErrorResponse(
                    err.message,
                    ErrorCodes.APIError,
                    err.details
                )
            );
    } else if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res
            .status(400)
            .json(
                createErrorResponse(
                    'Multer error',
                    ErrorCodes.MULTERError,
                    err as unknown as string
                )
            );
    } else if (err instanceof PostgresError) {
        return res
            .status(400)
            .json(
                createErrorResponse(err.message, ErrorCodes.PGError, err.detail)
            );
    } else {
        // Handle unexpected errors
        return res
            .status(500)
            .json(
                createErrorResponse(
                    'An unexpected error occurred on our end!',
                    ErrorCodes.ServerError
                )
            );
    }
}
