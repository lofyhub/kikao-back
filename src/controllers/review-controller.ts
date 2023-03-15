import { NextFunction, Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import rateLimiter from '../middlewares/rate_limit';
import { FatalError } from '../utilities/errors';
import { validateReviews } from '../utilities/zod';

import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

async function saveReviews(req: Request, res: Response, next: NextFunction) {
    try {
        const { house_id, user_id, rating, comment, listing_author_id, name } =
            req.body;
        const data = {
            house_id: house_id,
            user_id: user_id,
            rating: rating,
            comment: comment,
            listing_author_id: listing_author_id,
            name: name
        };

        await validateReviews(data);
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
        res.status(200).json(reviews);
        return;
    } catch (err) {
        next(err);
        return;
    }
}

router.post(
    '/reviews/',
    rateLimiter({ windowMs: 300000, max: 1 }),
    verifyToken,
    saveReviews
);
router.post(
    '/author/reviews/',
    rateLimiter({ windowMs: 1000, max: 1 }),
    getListingReviews
);

export default router;
