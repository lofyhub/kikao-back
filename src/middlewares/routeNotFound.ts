import { NextFunction, Response, Request } from 'express';
import { createErrorResponse } from '../utils/responseUtils';

export async function RouteNotFound(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const response = createErrorResponse(
        "404: Route not found! Looks like you've taken a wrong turn in the web maze."
    );

    return res.status(404).json(response);
}
