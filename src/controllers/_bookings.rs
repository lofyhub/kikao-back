import { NextFunction, Request, Response, Router } from 'express';
import { JWTUserPayload, booking } from '../interfaces';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { bookingSchema } from '../interfaces/booking';
import { ErrorCodes, ValidationError, validationMessage } from '../errors';

const router = Router();

async function saveBooking(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { userId, listingId, message, price, duration, checkInDate } =
        req.body;

    const user_id: string = (req.user as JWTUserPayload).id;

    const validateBooking = bookingSchema.safeParse(req.body);

    if (!validateBooking.success) {
        const validateError = validateBooking.error.format();
        return next(new ValidationError(validationMessage, validateError));
    }

    try {
    } catch (error) {
        return next(error);
    }
}

async function getUserBookings(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { text, duration, price } = req.body;

    const userId: string = (req.user as JWTUserPayload).id;

    try {
    } catch (error) {
        return next(error);
    }
}

async function updateBooking(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { text, duration, price } = req.body;

    const userId: string = (req.user as JWTUserPayload).id;

    try {
    } catch (error) {
        return next(error);
    }
}
async function deleteBooking(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { text, duration, price } = req.body;

    const userId: string = (req.user as JWTUserPayload).id;

    try {
    } catch (error) {
        return next(error);
    }
}

// Routes
router.post('/bookings', verifyJWTToken, saveBooking);
router.put(`/bookings/user`, verifyJWTToken, updateBooking);
router.get('/bookings/user', verifyJWTToken, getUserBookings);
router.delete('/booings/user', verifyJWTToken, deleteBooking);

export default router;
