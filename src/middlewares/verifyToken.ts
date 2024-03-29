import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../interfaces';
import env from '../env';

const publiceKey = Buffer.from(env.PUBLIC_KEY, 'base64').toString('utf8');

export async function verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.headers['x-access-token'] as string;
    if (!token) {
        res.status(401).send({ auth: false, message: 'No token provided.' });
        return;
    }

    try {
        const decoded = (await jwt.verify(token, publiceKey, {
            algorithms: ['RS256']
        })) as JwtPayload;
        req.body.userId = await decoded.userId;
        return next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token has expired. Please login again.'
            });
        }
        return next(error);
    }
}
