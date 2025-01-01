import { NextFunction, Request, Response, Router } from 'express';
import { createSuccessResponse } from '../utils/responseUtils';
import env from '../env';

const router = Router();

async function healthCheck(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    let data = {
        mood: 'Feeling awesome! 😎',
        timestamp: new Date().toISOString()
    };
    const message =
        'All systems are go! 🚀 The server is healthy and thriving.';

    res.status(200).json(createSuccessResponse(message, data));
}

router.get('/health', healthCheck);

export default router;
