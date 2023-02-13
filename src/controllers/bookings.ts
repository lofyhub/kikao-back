import { NextFunction, Request, Response, Router } from 'express';
import mongoose from 'mongoose';

import { verifyToken } from '../middlewares/verifyToken';
import { booking } from '../interfaces';
import { check, validationResult } from 'express-validator';
import rateLimiter from '../middlewares/rate_limit';

const router = Router();

async function handleBooking(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    const {
        name,
        telephone,
        userid,
        selectedDate,
        selectedTime,
        listingId,
        bookingFor
    } = req.body;

    if (!errors.isEmpty()) {
        res.status(422).json({ message: errors.array() });
        return;
    }

    const booking: booking = {
        bookedBy: name,
        bookedListing: listingId,
        telephoneNumber: telephone,
        selectedDate: selectedDate,
        bookedById: userid,
        bookingFor: bookingFor,
        selectTime: selectedTime
    };

    try {
        const collection = await mongoose.connection.db.collection('bookings');
        const userBookings = await collection
            .find({ bookedBy: name })
            .toArray();
        if (userBookings.length === 0) {
            const isBooked = await collection.insertOne({
                ...booking
            });
            res.status(200).json({ message: isBooked });
            return;
        }

        for (const booking of userBookings) {
            if (booking.bookedListing === listingId) {
                res.status(403).json({
                    message: 'You have already booked this Listing'
                });
                return;
            }
        }

        const bookingRes = await collection.insertOne({
            ...booking
        });

        return res.status(200).json({ message: bookingRes });
    } catch (error) {
        return next(error);
    }
}

async function getBookings(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    const { id } = req.body;

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const collection = await mongoose.connection.db.collection('bookings');
        const results = await collection.find({ bookingFor: id }).toArray();
        return res.status(200).json({ bookings: results });
    } catch (error) {
        return next(error);
    }
}

// Routes
router.post(
    '/bookings',
    rateLimiter({ windowMs: 1000, max: 1 }),
    verifyToken,
    [
        check('name')
            .not()
            .isEmpty()
            .isLength({ min: 4 })
            .withMessage('the name must have minimum length of 4')
            .trim(),
        check('telephone')
            .not()
            .isEmpty()
            .isNumeric()
            .isLength({ max: 10 })
            .withMessage('Telephone number must be 10'),
        check('listingId')
            .not()
            .isEmpty()
            .isLength({ min: 20 })
            .withMessage('ListingId must have minimum length of 20')
            .trim(),
        check('userid')
            .not()
            .isEmpty()
            .isLength({ min: 10 })
            .withMessage('userId must have minimum length of 10')
            .trim(),
        check('selectedDate')
            .not()
            .isEmpty()
            .withMessage('SelectedDate must be a valid Date'),
        check('selectedTime')
            .not()
            .isEmpty()
            .withMessage('SelectedTime must be a valid Time'),
        check('bookingFor')
            .not()
            .isEmpty()
            .isLength({ min: 10 })
            .withMessage('BookingFor must have minimum length of 10')
            .trim()
    ],
    handleBooking
);
router.post(
    '/user/bookings',
    rateLimiter({ windowMs: 1000, max: 1 }),
    verifyToken,
    [
        check('id')
            .not()
            .isEmpty()
            .isLength({ min: 4 })
            .withMessage('the name must have minimum length of 4')
            .trim()
    ],
    getBookings
);

export default router;
