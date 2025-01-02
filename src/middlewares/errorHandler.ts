import { Request, Response, NextFunction } from 'express';
import {
    NotFoundError,
    UnauthorizedError,
    DeleteFailedError,
    GenericError
} from '../errors';
import { createErrorResponse } from '../utils/responseUtils';
import multer from 'multer';
import { PostgresError } from 'postgres';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): any {
    console.error(err); // Log the error for internal debugging

    if (err instanceof NotFoundError) {
        return res.status(404).json({ message: err.message });
    } else if (err instanceof UnauthorizedError) {
        return res.status(401).json({ message: err.message });
    } else if (err instanceof DeleteFailedError) {
        return res.status(500).json({ message: err.message });
    } else if (err instanceof GenericError) {
        return res.status(500).json({ message: err.message });
    } else if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res
            .status(400)
            .json(
                createErrorResponse('Multer error', err as unknown as string)
            );
    } else if (err instanceof PostgresError) {
        const message = createErrorResponse(
            'Errod occured on our End',
            undefined,
            'PGError'
        );
        return res.status(400).json(message);
    } else {
        // Handle unexpected errors
        return res
            .status(500)
            .json(
                createErrorResponse(
                    'An unexpected error occurred',
                    err as unknown as string
                )
            );
    }
}
