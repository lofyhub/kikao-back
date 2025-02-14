import { z } from 'zod';

export interface IReview {
    user_id: string;
    review_text: string;
    rating: number;
    listing_id: string;
}

export interface IDBReview {
    id: string;
    user_id: string;
    review_text: string;
    rating: number;
    listing_id: string;
    created_at: Date;
    updated_at: Date;
}

export const reviewSchema = z.object({
    reviewText: z.string().nonempty(),
    rating: z.number(),
    listingId: z.string().uuid()
});
