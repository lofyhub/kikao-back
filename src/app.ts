import express from 'express';
import listingsController from './controllers/listings_controller';
import descriptionController from './controllers/generate_description';
import bookmarkController from './controllers/bookmark_controller';
import reviewController from './controllers/review_controller';
import healthController from './controllers/health_check';
import authController from './controllers/auth_controller';
import userController from './controllers/user_controller';
import paymentsController from './controllers/payment_controller';
import { errorHandler } from './middlewares/errorHandler';
import { RouteNotFound } from './middlewares/routeNotFound';
import { rateLimitHandler } from './middlewares/rateLimitHandler';
import { loggingMiddleware } from './middlewares/loggingMiddleware';
import { json as bodyParser } from 'body-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression'; // compresses requests
import env from './env';
import cors from 'cors';

const app = express();

// Middlewares
app.set('port', env.PORT);
app.use(cors());
app.use(compression());
app.use(bodyParser());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 100,
        max: 100,
        handler: rateLimitHandler
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
app.use('/api/v1/', paymentsController);
app.use(RouteNotFound);
app.use(errorHandler);

export default app;
