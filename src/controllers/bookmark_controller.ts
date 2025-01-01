import { NextFunction, Request, Response, Router } from 'express';
import bookmarkRepository from '../repository/bookmarkRepository';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import { NewBookmark } from '../db/schema';

const router = Router();

async function addBookmark(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { user_id, listing_id } = req.body;

    if (!user_id || !listing_id) {
        return res
            .status(309)
            .json(createErrorResponse('user_id and listing_id are required!'));
    }

    try {
        const data: NewBookmark = {
            userId: user_id,
            listingId: listing_id
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
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(309).json(createErrorResponse('userId is required!'));
    }

    if (typeof user_id !== 'string') {
        throw new Error('Userid should be a string');
    }
    try {
        const bookmarks = await bookmarkRepository.findUserBookmarkById(
            user_id
        );

        if (!bookmarks || bookmarks.length === 0) {
            return res
                .status(404)
                .json(
                    createErrorResponse(
                        'No bookmarks found for the given listing ID.'
                    )
                );
        }

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Bookmarks fetched successfully',
                    bookmarks
                )
            );
    } catch (error) {
        return next(error);
    }
}

async function fetchListingBookmarks(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { listing_id } = req.body;
    if (!listing_id) {
        return res
            .status(309)
            .json(createErrorResponse('ListingId is required!'));
    }

    if (typeof listing_id !== 'string') {
        throw new Error('ListingIDd should be a string');
    }
    try {
        const bookmarks = await bookmarkRepository.findUserBookmarkById(
            listing_id
        );

        if (!bookmarks || bookmarks.length === 0) {
            return res
                .status(404)
                .json(
                    createErrorResponse(
                        'No bookmarks found for the given listing ID.'
                    )
                );
        }

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Bookmarks fetched successfully',
                    bookmarks
                )
            );
    } catch (error) {
        return next(error);
    }
}

async function deleteBookmark(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { user_id, bookmark_id } = req.body;

    if (!user_id || !bookmark_id) {
        return res
            .status(400)
            .json(createErrorResponse('UserId and BookmarkId are required'));
    }

    try {
        const deleted_bookmark = await bookmarkRepository.deleteBookmark(
            bookmark_id
        );

        return res
            .status(201)
            .json(
                createSuccessResponse(
                    'Bookmark deleted successfully',
                    deleted_bookmark
                )
            );
    } catch (error) {
        next(error);
        return;
    }
}

// Routes
router.post('/bookmarks', addBookmark);
router.post('/user/bookmarks', fetchUserBookmarks);
router.post('/listing/bookmarks', fetchListingBookmarks);
router.delete('/delete/bookmarks', deleteBookmark);

export default router;
