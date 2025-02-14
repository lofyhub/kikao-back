import { NextFunction, Request, Response, Router } from 'express';
import reviewRepository from '../repository/reviewRepository';
import { createSuccessResponse } from '../utils/responseUtils';
import { NewReview } from '../db/schema';
import { JWTUserPayload } from '../interfaces';
import { listingIdSchema, userIdSchema } from '../interfaces/listing';
import { ValidationError, validationMessage } from '../errors';
import { reviewSchema } from '../interfaces/review';
import { verifyJWTToken } from '../middlewares/verifyToken';

const router = Router();

async function saveReview(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { rating, reviewText, listingId } = req.body;

    const userId: string = (req.user as JWTUserPayload).id;
    const validateReview = reviewSchema.safeParse(req.body);

    if (!validateReview.success) {
        const validateError = validateReview.error.format();
        return next(new ValidationError(validationMessage, validateError));
    }

    const data: NewReview = {
        userId,
        reviewText,
        rating,
        listingId
    };

    try {
        const savedReview = await reviewRepository.saveReview(data);

        return res
            .status(201)
            .json(
                createSuccessResponse('Review saved successfully', savedReview)
            );
    } catch (error) {
        return next(error);
    }
}

async function getListingReviews(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { listingId } = req.body;

    const validListingId = listingIdSchema.safeParse(listingId);

    if (!validListingId.success) {
        const validateError = validListingId.error.format();
        return next(new ValidationError(validationMessage, validateError));
    }

    try {
        const reviews = await reviewRepository.findReviewsByListingId(
            listingId
        );

        return res
            .status(200)
            .json(
                createSuccessResponse('Reviews fetched successfully', reviews)
            );
    } catch (error) {
        return next(error);
    }
}

async function deleteReview(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { reviewId } = req.body;

    const userId: string = (req.user as JWTUserPayload).id;
    const validReviewId = userIdSchema.safeParse(reviewId);

    if (!validReviewId.success) {
        const error_formatted = validReviewId.error.format();
        return next(new ValidationError(validationMessage, error_formatted));
    }

    try {
        const savedReview = await reviewRepository.deleteReview(
            reviewId,
            userId
        );

        return res
            .status(201)
            .json(
                createSuccessResponse(
                    'Review deleted successfully',
                    savedReview
                )
            );
    } catch (error) {
        return next(error);
    }
}

router.get('/user/reviews/', getListingReviews);
router.post('/user/reviews/', verifyJWTToken, saveReview);
router.delete('/user/reviews/', verifyJWTToken, deleteReview);

export default router;
