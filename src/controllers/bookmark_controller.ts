import { NextFunction, Request, Response, Router } from 'express';
import bookmarkRepository from '../repository/bookmarkRepository';
import { createSuccessResponse } from '../utils/responseUtils';
import { NewBookmark } from '../db/schema';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { JWTUserPayload } from '../interfaces';
import { listingIdSchema, userIdSchema } from '../interfaces/listing';
import { ValidationError, validationMessage } from '../errors';
import { ResponseGetBookmarks } from '../interfaces/bookmark';

const router = Router();

async function addBookmark(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { listingId } = req.body;
    const userId: string = (req.user as JWTUserPayload).id;

    const listingIdValidation = listingIdSchema.safeParse(listingId);

    if (!listingIdValidation.success) {
        const error_formatted = listingIdValidation.error.format();
        return next(new ValidationError(validationMessage, error_formatted));
    }

    try {
        const data: NewBookmark = {
            userId,
            listingId
        };
        const result = bookmarkRepository.saveBookmark(data);

        return res
            .status(201)
            .json(createSuccessResponse('Review saved successfully', result));
    } catch (error) {
        return next(error);
    }
}

async function fetchUserBookmarks(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { userId } = req.body;

    const userIdValidation = userIdSchema.safeParse(userId);

    if (!userIdValidation.success) {
        const error_formatted = userIdValidation.error.format();
        return next(new ValidationError(validationMessage, error_formatted));
    }

    try {
        const bookmarks = await bookmarkRepository.findUserBookmarksById(
            userId
        );

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'User bookmarks fetched successfully!',
                    bookmarks
                )
            );
    } catch (error: unknown) {
        return next(error);
    }
}

async function fetchListingBookmarks(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { listingId } = req.body;

    const listingIdValidation = listingIdSchema.safeParse(listingId);

    if (!listingIdValidation.success) {
        const error_formatted = listingIdValidation.error.format();
        return next(new ValidationError(validationMessage, error_formatted));
    }

    try {
        const bookmarks = await bookmarkRepository.fetchListingBookmarks(
            listingId
        );

        const bookmarksData: ResponseGetBookmarks = {
            bookmarks,
            count: bookmarks.length
        };

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Bookmarks fetched successfully',
                    bookmarksData
                )
            );
    } catch (error: unknown) {
        return next(error);
    }
}

async function deleteBookmark(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { bookmarkId } = req.body;
    const userId: string = (req.user as JWTUserPayload).id;

    const validBookmarkId = userIdSchema.safeParse(bookmarkId);

    if (!validBookmarkId.success) {
        const error_formatted = validBookmarkId.error.format();
        return next(new ValidationError(validationMessage, error_formatted));
    }

    try {
        const deleted_bookmark = await bookmarkRepository.deleteBookmark(
            bookmarkId,
            userId
        );

        return res
            .status(201)
            .json(
                createSuccessResponse(
                    'Bookmark deleted successfully!',
                    deleted_bookmark
                )
            );
    } catch (error) {
        return next(error);
    }
}

// Routes
router.post('/user/bookmarks', fetchUserBookmarks);
router.post('/bookmarks', verifyJWTToken, addBookmark);
router.post('/listing/bookmarks', fetchListingBookmarks);
router.delete('/delete/bookmarks', verifyJWTToken, deleteBookmark);

export default router;
