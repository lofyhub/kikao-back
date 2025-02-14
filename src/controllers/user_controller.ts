import { NextFunction, Request, Response, Router } from 'express';
import User from '../repository/userRepository';
import Listing from '../repository/listingRepository';
import { createSuccessResponse } from '../utils/responseUtils';
import { z } from 'zod';
import { ValidationError, validationMessage } from '../errors';
import { ResponseGetUser } from '../interfaces/listing';

const router = Router();

const idSchema = z.string().uuid();
async function getListingAuthor(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { Id } = req.body;

    const idValid = idSchema.safeParse(Id);

    if (!idValid.success) {
        const error_formatted = idValid.error.format();
        return next(new ValidationError(validationMessage, error_formatted));
    }
    try {
        const existingUser = await User.getUserById(Id);

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

    const idValid = idSchema.safeParse(Id);

    if (!idValid.success) {
        const error_formatted = idValid.error.format();

        return next(new ValidationError(validationMessage, error_formatted));
    }

    try {
        const userListings = await Listing.getUserListings(Id);

        const userData: ResponseGetUser = {
            userListings,
            count: userListings.length
        };

        return res
            .status(200)
            .json(createSuccessResponse('Successful', userData));
    } catch (error: unknown) {
        return next(error);
    }
}

// Routes
router.post('/listing/author', getListingAuthor);
router.post('/author/listings', getUserListings);

export default router;
