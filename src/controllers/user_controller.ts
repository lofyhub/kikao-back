import { NextFunction, Request, Response, Router } from 'express';
import User from '../repository/userRepository';
import Listing from '../repository/listingRepository';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import { z } from "zod";

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
        const message = "Validation error occured!";

        return res.status(403).json(createErrorResponse(message,"APIError",error_formatted))
    }
    try {
        const existingUser = await User.getUserById(Id);

        if (!existingUser) {
            const res_body = createErrorResponse(
                'Listing author with the given ID was not found'
            );

            return res.status(300).json(res_body);
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
        return res.status(400).json({ message: 'Id is required!' });
    }

    const idValid = idSchema.safeParse(Id);

    if (!idValid.success) {
        const error_formatted = idValid.error.format();
        const message = "Validation error occured!";

        return res.status(403).json(createErrorResponse(message,"APIError",error_formatted))
    }

    try {
        const userListings = await Listing.getUserListings(Id);

        const res_body = createSuccessResponse('Successful', {
            userListings,
            count: userListings.length
        });
        return res.status(200).json(res_body);
    } catch (error) {
        next(error);
        return;
    }
}

// Routes
router.post('/listing/author', getListingAuthor);
router.post('/author/listings', getUserListings);

export default router;
