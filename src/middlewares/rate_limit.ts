import { NextFunction, Request, Response } from 'express';
import rateLimit, { Options } from 'express-rate-limit';
import env from '../env';

function rateLimiter(options: Partial<Options>) {
    if (env.testMode) {
        return function (req: Request, res: Response, next: NextFunction) {
            return next();
        };
    }
    return rateLimit({
        message: `Too many requests. Please try again later.`,
        legacyHeaders: false,
        ...options
    });
}

export default rateLimiter;
