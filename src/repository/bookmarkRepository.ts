import { db } from '../db';
import { bookmarks, NewBookmark, Bookmark } from '../db/schema';
import { eq } from 'drizzle-orm';
import { DeleteFailedError, NotFoundError} from '../errors';

class BookmarkRepository {
    async saveBookmark(review: NewBookmark): Promise<Bookmark> {
        const result = await db.insert(bookmarks).values(review).returning();

        return result[0];
    }
    async findUserBookmarkById(user_id: string): Promise<Bookmark[]> {
        const result = await db
            .select()
            .from(bookmarks)
            .where(eq(bookmarks.id, user_id));

        return result;
    }

    async fetchListingBookmarks(listing_id: string): Promise<Bookmark[]> {
        const result = await db
            .select()
            .from(bookmarks)
            .where(eq(bookmarks.id, listing_id));

        return result;
    }
    async deleteBookmark(bookmark_id: string): Promise<Bookmark> {
        const bookmark_to_delete = await db
            .select()
            .from(bookmarks)
            .where(eq(bookmarks.id, bookmark_id));

        if (!bookmark_to_delete || bookmark_to_delete.length === 0) {
            throw new NotFoundError(
                `Listing with ID ${bookmark_id} not found.`
            );
        }

        const is_deleted = await db
            .delete(bookmarks)
            .where(eq(bookmarks.id, bookmark_id));

        if (!is_deleted) {
            throw new DeleteFailedError(`Listing deletion was not successful.`);
        }

        return bookmark_to_delete[0];
    }
}

export default new BookmarkRepository();
