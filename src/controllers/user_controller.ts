import { NextFunction, Request, Response, Router } from 'express';
import User from '../repository/userRepository';
import Listing from '../repository/listingRepository';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import { z } from 'zod';
import { validationMessage } from '../errors';

const router = Router();

const idSchema = z.string();
async function getListingAuthor(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { Id } = req.body;

    if (!Id) {
        const message = 'Id is required';
        return res.status(403).json(createErrorResponse(message));
    }

    const idValid = idSchema.safeParse(Id);

    if (!idValid.success) {
        const error_formatted = idValid.error.format();

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
        const existingUser = await User.getUserById(Id);

        if (!existingUser) {
            const res_body = createErrorResponse(
                `Listing author with ID ${Id} was not found!`
            );

            return res.status(404).json(res_body);
        }

        const res_body = createSuccessResponse('Successful', existingUser);

        return res.status(200).json(res_body);
    } catch (error: unknown) {
        return next(error);
    }
}

async function getUserListings(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { Id } = req.body;

    if (!Id) {
        return res.status(403).json(createErrorResponse('Id is required!'));
    }

    const idValid = idSchema.safeParse(Id);

    if (!idValid.success) {
        const error_formatted = idValid.error.format();

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
        const userListings = await Listing.getUserListings(Id);

        const res_body = createSuccessResponse('Successful', {
            userListings,
            count: userListings.length
        });
        return res.status(200).json(res_body);
    } catch (error: unknown) {
        return next(error);
    }
}

// Routes
router.post('/listing/author', getListingAuthor);
router.post('/author/listings', getUserListings);

export default router;
