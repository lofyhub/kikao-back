import { db } from '../db';
import { bookmarks, NewBookmark, Bookmark } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
    DeleteFailedError,
    GenericError,
    NotFoundError,
    UnauthorizedError
} from '../errors';

class BookmarkRepository {
    async saveBookmark(review: NewBookmark): Promise<Bookmark> {
        const result = await db.insert(bookmarks).values(review).returning();

        if (!result || result.length === 0) {
            throw new GenericError(
                'Error occured while saving bookmark, Try again!'
            );
        }

        return result[0];
    }
    async findBookmarkWithId(bookmark_id: string): Promise<Bookmark> {
        const result = await db
            .select()
            .from(bookmarks)
            .where(eq(bookmarks.id, bookmark_id));

        if (!result || result.length === 0) {
            throw new NotFoundError(
                `Bookmark with ID ${bookmark_id} was not found!`
            );
        }

        return result[0];
    }
    async findUserBookmarksById(user_id: string): Promise<Bookmark[]> {
        const result = await db
            .select()
            .from(bookmarks)
            .where(eq(bookmarks.id, user_id));

        if (!result || result.length === 0) {
            throw new NotFoundError(`No bookmarks found for this user!`);
        }

        return result;
    }

    async fetchListingBookmarks(listing_id: string): Promise<Bookmark[]> {
        const result = await db
            .select()
            .from(bookmarks)
            .where(eq(bookmarks.id, listing_id));

        if (!result || result.length === 0) {
            throw new NotFoundError('No bookmarks found for listing ID!');
        }
        return result;
    }
    async deleteBookmark(
        bookmark_id: string,
        user_id: string
    ): Promise<Bookmark> {
        const bookmark_to_delete = await this.findBookmarkWithId(bookmark_id);

        if (bookmark_to_delete.userId !== user_id) {
            throw new UnauthorizedError(`You can only delete your bookmark!`);
        }

        const is_deleted = await db
            .delete(bookmarks)
            .where(eq(bookmarks.id, bookmark_id));

        if (!is_deleted) {
            throw new DeleteFailedError(
                `Bookmark deletion was not successful.`
            );
        }

        return bookmark_to_delete;
    }
}

export default new BookmarkRepository();
