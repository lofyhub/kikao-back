import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../env';
import { createErrorResponse } from '../utils/responseUtils';
import { JWTUserPayload } from '../interfaces';

// The function to verify the JWT token
export async function verifyJWTToken(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res
            .status(401)
            .json(createErrorResponse('Access denied. No token provided.'));
    }

    try {
        const res = jwt.verify(token, env.JWT_SECRET) as JWTUserPayload;
        req.user = res;
        return next();
    } catch (error: unknown) {
        return res
            .status(400)
            .json(createErrorResponse('Invalid or expired token.'));
    }
}
