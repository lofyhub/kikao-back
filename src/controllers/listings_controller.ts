import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import {File, JWTUserPayload } from '../interfaces';
import { cloudinaryInstance } from '../utils/cloudinary';
import listingRepository, { Filters } from '../repository/listingRepository';
import { NewListing} from '../db/schema';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import env from '../env';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { checkImageUploadFileType } from '../utils/multer';
import {
    NewCompartmentWithoutListingId,
    NewRateWithoutListingId,
    UpdateListing
} from '../interfaces/listing';

const router = Router();

const multerStorage = multer.memoryStorage();

const multi_upload = multer({
    limits: { fileSize: env.IMAGE_UPLOAD_SIZE_LIMIT }, // fileSize (in bytes)
    fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
        checkImageUploadFileType(file, callback);
    },
    storage: multerStorage
}).array('listing_images', 8);

async function createUserListing(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const {
        title,
        location,
        price,
        duration,
        bedrooms,
        totalrooms,
        washrooms,
        parking,
        size,
        status,
        county,
        description,
        wifi,
        security,
        garbagecollection,
        roomnumber,
        year,
        userId
    } = req.body;

    // TODO: Ensure a user can only post a listing with his Id and not anyone elses
    // Also here we are quite sure we have the user id from the token
    const user_id: string = (req.user as JWTUserPayload).id;

    if (userId !== user_id) {
        return res
            .status(401)
            .json(
                createErrorResponse(
                    'Sorry, you are only able to create listings for yourself!'
                )
            );
    }

    if (!req.files || req.files.length === 0) {
        return res
            .status(400)
            .json(
                createErrorResponse('Please upload some images with the data!')
            );
    }

    try {
        const files: File[] = Array.isArray(req.files)
            ? req.files
            : Object.values(req.files).flat();

        const uploadUrls: string[] = [];
        for (let i = 0; i < files.length; ++i) {
            const path: string = files[i].path;
            const { imageURL } = await cloudinaryInstance.uploadImage(path);
            if (imageURL) {
                uploadUrls.push(imageURL);
            }
        }
        const imageUrls = await uploadUrls;

        const listing: NewListing = {
            name: title,
            location,
            county,
            size,
            status,
            userId,
            yearBuilt: year,
            images: imageUrls,
            description: description
        };

        const rates: NewRateWithoutListingId = {
            price: price,
            duration: duration,
            countryCode: 'kshs'
        };

        const compartments: NewCompartmentWithoutListingId = {
            bedrooms,
            totalRooms: totalrooms,
            washRooms: washrooms,
            parking: parking,
            roomNumber: roomnumber,
            security: security,
            wifi: wifi,
            garbageCollection: garbagecollection
        };

        const result = await listingRepository.createListing(
            listing,
            rates,
            compartments
        );

        return res
            .status(201)
            .json(createSuccessResponse('Successful', result));
    } catch (error) {
        return next(error);
    }
}

async function deleteListing(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { account_id, user_id } = req.body;

    const userId: string = (req.user as JWTUserPayload).id;

    if (userId !== user_id) {
        return res
            .status(401)
            .json(
                createErrorResponse(
                    'Sorry, you are only able to delete your own listings!'
                )
            );
    }

    try {
        const listing_delete = await listingRepository.findListingById(user_id);

        if (!listing_delete || listing_delete?.id !== account_id) {
            return res
                .status(401)
                .json(
                    createErrorResponse(
                        'Sorry, you are only able to delete listings that only you have created'
                    )
                );
        }

        const listing_to_delete = await listingRepository.deleteListing(
            user_id
        );

        if (!listing_to_delete) {
            return res
                .status(404)
                .json(
                    createErrorResponse('Listing deletion was not successful!')
                );
        }

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Successfully deleted listing',
                    listing_to_delete
                )
            );
    } catch (error: unknown) {
        return next(error);
    }
}

async function updateListing(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const {
        listingId,
        name,
        location,
        status,
        county,
        yearBuilt,
        description,
        size,
        userId,
        ratesId,
        price,
        duration,
        compartmentsId,
        bedrooms,
        totalRooms,
        washRooms,
        parking,
        roomNumber,
        security,
        garbageCollection,
        wifi
    } = req.body;

    const user_id: string = (req.user as JWTUserPayload).id;

    if (userId !== user_id) {
        return res
            .status(401)
            .json(
                createErrorResponse(
                    'Sorry, you are only able to update your own listings!'
                )
            );
    }

    const updates: UpdateListing = {
        name,
        location,
        status,
        county,
        yearBuilt,
        description,
        size,
        ratesId,
        price,
        duration,
        compartmentsId,
        bedrooms,
        totalRooms,
        washRooms,
        parking,
        roomNumber,
        security,
        garbageCollection,
        wifi
    };

    // Don't proceed if there are no updates to make
    if (Object.keys(updates).length === 0) {
        return res.status(400).json(createErrorResponse('No updates to make'));
    }

    const user_listing = await listingRepository.findListingById(listingId);

    // TODO: A better way to verify the user updating the listing
    if (!user_listing || user_listing?.id !== listingId) {
        return res
            .status(403)
            .json(
                createErrorResponse(
                    'Sorry, you are only able to edit listings that you have created'
                )
            );
    }

    try {
        const result = await listingRepository.updateListing(
            listingId,
            updates
        );

        if (!result) {
            return res
                .status(404)
                .json(
                    createErrorResponse(
                        'Listing not found or update was not successful.'
                    )
                );
        }

        return res
            .status(200)
            .json(
                createSuccessResponse('Listing successfully updated', result)
            );
    } catch (error) {
        return next(error);
    }
}

async function getListings(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    try {
        const listings = await listingRepository.getAllListings();
        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Succesfully retrieved listing!',
                    listings
                )
            );
    } catch (error) {
        return next(error);
    }
}

async function getListing(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { id } = req.body;
    try {
        const listing = await listingRepository.findListingById(id);

        if (!listing) {
            return res
                .status(404)
                .json(createErrorResponse(`Listing with id ${id} not found.`));
        }

        return res
            .status(200)
            .json(
                createSuccessResponse('Succesfully retrieved listing!', listing)
            );
    } catch (error) {
        return next(error);
    }
}

async function filterListings(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { filters }: { filters: Filters } = req.body;
    try {
        const filteredListings = listingRepository.filteredListing(filters);

        if (!filteredListings) {
            return res
                .status(404)
                .json(
                    createErrorResponse(
                        'Filtered Listing retreeival was not successful!'
                    )
                );
        }

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Succesfully retrieved listing!',
                    filteredListings
                )
            );
    } catch (error) {
        return next(error);
    }
}

// Routes
router.get('/listings', getListings);
router.post('/user/listing', getListing);
router.post('/sort/listings', filterListings);
router.delete('/user/listings', deleteListing);
router.put('/user/listings', verifyJWTToken, updateListing);
router.post('/user/listings', multi_upload, verifyJWTToken, createUserListing);

export default router;
