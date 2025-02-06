import { NextFunction, Request, Response, Router } from 'express';
import bookmarkRepository from '../repository/bookmarkRepository';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import { NewBookmark } from '../db/schema';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { JWTUserPayload } from '../interfaces';
import { listingIdSchema, userIdSchema } from '../interfaces/listing';
import { validationMessage } from '../errors';

const router = Router();

async function addBookmark(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { userId, listingId } = req.body;

    if (!userId || !listingId) {
        return res
            .status(309)
            .json(createErrorResponse('userId and listingId are required!'));
    }

    const userIdValidation = userIdSchema.safeParse(userId);
    const listingIdValidation = listingIdSchema.safeParse(listingId);

    if (!userIdValidation.success) {
        const error_formatted = userIdValidation.error.format();
        return res
            .status(403)
            .json(
                createErrorResponse(
                    validationMessage,
                    'APIError',
                    error_formatted
                )
            );
    } else if (!listingIdValidation.success) {
        const error_formatted = listingIdValidation.error.format();
        return res
            .status(403)
            .json(
                createErrorResponse(
                    validationMessage,
                    'APIError',
                    error_formatted
                )
            );
    }

    try {
        const data: NewBookmark = {
            userId: userId,
            listingId: listingId
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

    if (!userId) {
        return res.status(309).json(createErrorResponse('userId is required!'));
    }
    const userIdValidation = userIdSchema.safeParse(userId);

    if (!userIdValidation.success) {
        const error_formatted = userIdValidation.error.format();
        return res
            .status(403)
            .json(
                createErrorResponse(
                    validationMessage,
                    'APIError',
                    error_formatted
                )
            );
    }

    try {
        const bookmarks = await bookmarkRepository.findUserBookmarkById(userId);

        if (!bookmarks || bookmarks.length === 0) {
            return res
                .status(404)
                .json(createErrorResponse('No bookmarks found for this user.'));
        }

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'User bookmarks fetched successfully!',
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
    const { listingId } = req.body;
    if (!listingId) {
        return res
            .status(309)
            .json(createErrorResponse('listingId is required!'));
    }

    const listingIdValidation = listingIdSchema.safeParse(listingId);

    if (!listingIdValidation.success) {
        const error_formatted = listingIdValidation.error.format();
        return res
            .status(403)
            .json(
                createErrorResponse(
                    validationMessage,
                    'APIError',
                    error_formatted
                )
            );
    }

    try {
        const bookmarks = await bookmarkRepository.findUserBookmarkById(
            listingId
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
    const { userId, bookmarkId } = req.body;

    if (!userId || !bookmarkId) {
        return res
            .status(400)
            .json(createErrorResponse('UserId and BookmarkId are required'));
    }

    const user_id: string = (req.user as JWTUserPayload).id;

    if (userId !== user_id) {
        return res
            .status(401)
            .json(
                createErrorResponse(
                    'Sorry, you are only able to delete your own Bookmark!'
                )
            );
    }

    try {
        const deleted_bookmark = await bookmarkRepository.deleteBookmark(
            bookmarkId
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
router.post('/bookmarks', verifyJWTToken, addBookmark);
router.post('/user/bookmarks', fetchUserBookmarks);
router.post('/listing/bookmarks', fetchListingBookmarks);
router.delete('/delete/bookmarks', verifyJWTToken, deleteBookmark);

export default router;
