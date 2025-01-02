import { NextFunction, Request, Response, Router } from 'express';
import User from '../repository/userRepository';
import Listing from '../repository/listingRepository';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';

const router = Router();

async function getListingAuthor(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { id } = req.body;
    if (!id) {
        const message = 'Id is required';
        return res.status(403).json(createErrorResponse(message));
    }

    if (typeof id !== 'string') {
        throw new Error('Id should be a string!');
    }
    try {
        const existingUser = await User.getUserById(id);

        if (!existingUser) {
            const res_body = createErrorResponse(
                'Listing author with the given ID was not found'
            );

            return res.status(300).json(res_body);
        }

        const res_body = createSuccessResponse('Successful', existingUser);

        return res.status(200).json(res_body);
    } catch (error:unknown) {
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
        res.status(400).json({ message: 'Id is required!' });
        return;
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
