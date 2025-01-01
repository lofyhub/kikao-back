import { NextFunction, Request, Response } from 'express';
import { debug } from './debug';
import { ErrorType, isErrorType } from './errors';

export default function errorHandler<T extends Error>(
    err: T,
    req: Request,
    res: Response,
    next: NextFunction
): any {
    debug(err.message);
    const name = err.name;

    if (!isErrorType(name)) {
        debug(`Unknown error type: ${name}`);
        res.status(500).send({
            error: 'Internal Server Error'
        });
        next();
    }
    switch (name) {
        case ErrorType.NotFoundError:
            res.status(404).json({ error: err.message });
            break;
        case ErrorType.ValidationError:
            res.status(400).json({ error: err.message });
            break;
        case ErrorType.DatabaseValidationError:
            res.status(403).json({ error: 'Database validation error' });
            break;
        case ErrorType.FatalError:
            res.status(500).json({ error: 'Internal server error' });
            break;
    }

    next();
}
