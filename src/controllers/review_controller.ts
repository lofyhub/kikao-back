import { NextFunction, Request, Response, Router } from 'express';
import reviewRepository from '../repository/reviewRepository';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import { NewReview } from '../db/schema';

const router = Router();

async function saveReview(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { userId, rating, reviewText, listingId } = req.body;

    if (!userId || !rating || !reviewText || !listingId) {
        return res
            .status(400)
            .json(
                createErrorResponse(
                    'Missing required fields: userId, rating, reviewText, or listingId.'
                )
            );
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
        next(error);
        return;
    }
}

async function getListingReviews(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { listing_id } = req.body;

    if (!listing_id) {
        return res
            .status(400)
            .json(createErrorResponse('No ReviewID provided!'));
    }

    try {
        const reviews = await reviewRepository.findReviewsByListingId(
            listing_id
        );

        if (!reviews || reviews.length === 0) {
            return res
                .status(404)
                .json(
                    createErrorResponse(
                        'No reviews found for the given listing ID.'
                    )
                );
        }

        return res
            .status(200)
            .json(
                createSuccessResponse('Reviews fetched successfully', reviews)
            );
    } catch (error) {
        next(error);
        return;
    }
}

async function deleteReview(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { review_id } = req.body;

    if (!review_id || typeof review_id !== 'string') {
        return res
            .status(400)
            .json(
                createErrorResponse(
                    `Review ID ${review_id} is required and must be a string.`
                )
            );
    }

    try {
        const savedReview = await reviewRepository.deleteReview(review_id);

        return res
            .status(201)
            .json(
                createSuccessResponse(
                    'Review deleted successfully',
                    savedReview
                )
            );
    } catch (error) {
        next(error);
        return;
    }
}

router.post('/reviews/', saveReview);
router.delete('/reviews/', deleteReview);
router.post('/author/reviews/', getListingReviews);

export default router;
