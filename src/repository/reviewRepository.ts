import { reviews, NewReview, Review } from '../db/schema';
import { DeleteFailedError, NotFoundError} from '../errors';
import { eq } from 'drizzle-orm';
import { db } from '../db';

class ReviewRepository {
    async saveReview(review: NewReview): Promise<Review> {
        const results = await db.insert(reviews).values(review).returning();
        return results[0];
    }

    async findReviewsByListingId(listing_id: string): Promise<Review[]> {
        const result = await db
            .select()
            .from(reviews)
            .where(eq(reviews.id, listing_id));
        return result;
    }

    async deleteReview(review_id: string): Promise<Review> {
        const bookmark_to_delete = await db
            .select()
            .from(reviews)
            .where(eq(reviews.id, review_id));

        if (!bookmark_to_delete || bookmark_to_delete.length === 0) {
            throw new NotFoundError(`Listing with ID ${review_id} not found.`);
        }

        const is_deleted = await db
            .delete(reviews)
            .where(eq(reviews.id, review_id));

        if (!is_deleted) {
            throw new DeleteFailedError(`Listing deletion was not successful.`);
        }

        return bookmark_to_delete[0];
    }
}

export default new ReviewRepository();
