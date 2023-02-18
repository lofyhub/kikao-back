import { NextFunction, Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { is, validate } from 'superstruct';
import rateLimiter from '../middlewares/rate_limit';
import { FatalError, ValidationError } from '../utilities/errors';
import { reviewSchema } from '../interfaces/index';

import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

async function saveReviews(req: Request, res: Response, next: NextFunction) {
    try {
        const { data } = req.body;

        if (!is(data, reviewSchema)) {
            const [error] = validate(data, reviewSchema);
            if (!error) {
                throw new FatalError('Unexpected condition!');
            }
            throw new ValidationError(error.message);
        }
        const created_at = new Date();

        const collection = await mongoose.connection.db.collection('reviews');
        const reviewsRes = await collection.insertOne({ ...data, created_at });

        return res.status(200).json({ ...reviewsRes });
    } catch (err) {
        next(err);
        return;
    }
}

async function getListingReviews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { author_id } = req.body;
        if (!author_id) {
            throw new FatalError('No author_id on paginated route!');
        }
        const collection = await mongoose.connection.db.collection('reviews');
        const reviews = await collection
            .find({ listing_author_id: author_id })
            .toArray();
        return res.status(200).json(reviews);
    } catch (err) {
        next(err);
        return;
    }
}

router.post(
    '/reviews/',
    rateLimiter({ windowMs: 1000, max: 1 }),
    verifyToken,
    saveReviews
);
router.post(
    '/author/reviews/',
    rateLimiter({ windowMs: 1000, max: 1 }),
    getListingReviews
);

export default router;
