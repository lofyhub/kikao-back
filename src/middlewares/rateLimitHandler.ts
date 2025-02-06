import { NextFunction, Response, Request } from 'express';
import { createErrorResponse } from '../utils/responseUtils';

export async function rateLimitHandler(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    console.warn(`DDoS Attempt from ${req.ip}`);
    const message =
        "Hold your horses! 🐎 You're sending too many requests. Give it a minute and try again, or we might call in the cavalry! 🛡️";

    return res.status(429).json(createErrorResponse(message));
}
