/**
 * This is a middleware example, and helps with debugging by outputing data for each request on the console.
 */

import { NextFunction, Response, Request } from 'express';
import { debug } from '../utils/debug';

export function loggingMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    debug(`${req.method}: ${req.originalUrl}`);
    next();
}
