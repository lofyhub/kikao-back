import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { json as bodyParser } from 'body-parser';
import compression from 'compression'; // compresses requests

import env from './env';
import listingsController from './controllers/listings_controller';
import healthController from './controllers/health_check';
import authController from './controllers/auth_controller';
import userController from './controllers/user_controller';
import descriptionController from './controllers/generate_description';
import reviewController from './controllers/review_controller';
import bookmarkController from './controllers/bookmark_controller';
import { debug } from './utils/debug';
import { errorHandler } from './middlewares/errorHandler';
import { createErrorResponse } from './utils/responseUtils';

/**
 * This is a middleware example, and helps with debugging by outputing data for each request on the console.
 */
function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
    debug(`${req.method}: ${req.originalUrl}`);
    next();
}

const app = express();

// Middlewares
app.set('port', env.PORT);
app.use(cors());
app.use(compression());
app.use(bodyParser());
app.use(errorHandler);
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        handler: (req, res) => {
            console.warn(`DDoS Attempt from ${req.ip}`);
            res.status(429).json(
                createErrorResponse(
                    "Hold your horses! 🐎 You're sending too many requests. Give it a minute and try again, or we might call in the cavalry! 🛡️"
                )
            );
        }
    })
);
app.use(loggingMiddleware);

// Controllers
// Version 1 routes
app.use('/api/v1/', healthController);
app.use('/api/v1/', userController);
app.use('/api/v1/', authController);
app.use('/api/v1/', reviewController);
app.use('/api/v1/', listingsController);
app.use('/api/v1/', descriptionController);
app.use('/api/v1/', bookmarkController);
app.use(function (req, res, next) {
    let response = createErrorResponse(
        "404: Route not found! Looks like you've taken a wrong turn in the web maze."
    );

    res.status(404).send(response);
});

export default app;
