import { NextFunction, Request, Response, Router } from 'express';
import { createSuccessResponse } from '../utils/responseUtils';
import env from '../env';

const router = Router();

type HealthCheckData = {
    NODE_ENV: string;
    API_VERSION: string;
    IP: string | undefined;
    timestamp: string;
};

async function healthCheck(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const message = 'All systems are go! 🚀';

    const data: HealthCheckData = {
        NODE_ENV: env.NODE_ENV,
        API_VERSION: '/api/v1/',
        IP: req.ip,
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(createSuccessResponse(message, data));
}

router.get('/health', healthCheck);

export default router;
