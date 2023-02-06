import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { json as bodyParser } from 'body-parser';
import compression from 'compression'; // compresses requests

import env from './env';
import authController from './controllers/auth-controller';
import listingsController from './controllers/listings-controller';
import userController from './controllers/user-controller';
import bookingController from './controllers/bookings';
import { debug } from './utilities/debug';

/**
 * This is a middleware example, and helps with debugging by outputing data for each request on the console.
 */
function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
    debug(`${req.method}: ${req.originalUrl}`);
    next();
}

const app = express();

// Middlewares
app.set('port', env.port);
app.use(loggingMiddleware);
app.use(cors());
app.use(compression());
app.use(bodyParser());
app.use('/uploads', express.static('uploads'));

// Controllers
app.use(authController);
app.use(listingsController);
app.use(userController);
app.use(bookingController);

export default app;
