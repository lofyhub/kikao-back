import { reviews, NewReview, Review } from '../db/schema';
import {
    DeleteFailedError,
    GenericError,
    NotFoundError,
    UnauthorizedError
} from '../errors';
import { eq } from 'drizzle-orm';
import { db } from '../db';

class ReviewRepository {
    async saveReview(review: NewReview): Promise<Review> {
        const results = await db.insert(reviews).values(review).returning();
        return results[0];
    }
    async findReviewById(review_id: string): Promise<Review> {
        const result = await db
            .select()
            .from(reviews)
            .where(eq(reviews.id, review_id));

        if (!result || result.length === 0) {
            throw new NotFoundError(`Review with ID ${review_id} not found.`);
        }

        return result[0];
    }

    async findReviewsByListingId(listing_id: string): Promise<Review[]> {
        const result = await db
            .select()
            .from(reviews)
            .where(eq(reviews.listingId, listing_id));

        if (!result || result.length === 0) {
            throw new NotFoundError(
                `No reviews found for the given listing ID.`
            );
        }
        return result;
    }

    async deleteReview(review_id: string, user_id: string): Promise<Review> {
        const review_to_delete = await this.findReviewById(review_id);

        if (review_to_delete.userId !== user_id) {
            const message = 'You can only delete your Review!';
            throw new UnauthorizedError(message);
        }

        const is_deleted = await db
            .delete(reviews)
            .where(eq(reviews.id, review_id));

        if (!is_deleted) {
            throw new DeleteFailedError(`Review deletion was not successful!`);
        }

        return review_to_delete;
    }
}

export default new ReviewRepository();
