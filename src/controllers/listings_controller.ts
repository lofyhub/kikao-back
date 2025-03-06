import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { File, JWTUserPayload } from '../interfaces';
import { cloudinaryInstance } from '../utils/cloudinary';
import listingRepository, { Filters } from '../repository/listingRepository';
import { NewListing } from '../db/schema';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import env from '../env';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { checkImageUploadFileType } from '../utils/multer';
import {
    NewCompartmentSchema,
    NewCompartmentWithoutListingId,
    NewListingSchema,
    NewRateSchema,
    NewRateWithoutListingId,
    UpdateListing,
    listingIdSchema,
    updateListingSchema,
    userIdSchema,
    ratesIdSchema
} from '../interfaces/listing';
import {
    ErrorCodes,
    UnauthorizedError,
    ValidationError,
    validationMessage
} from '../errors';

const router = Router();

const multerStorage = multer.memoryStorage();

const multi_upload = multer({
    limits: { fileSize: env.IMAGE_UPLOAD_SIZE_LIMIT }, // fileSize (in bytes)
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        callback: multer.FileFilterCallback
    ) => {
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
        name,
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
        yearBuilt
    } = req.body;

    try {
        const userId: string = (req.user as JWTUserPayload).id;

        if (!req.files || req.files.length === 0) {
            return res
                .status(400)
                .json(
                    createErrorResponse(
                        'Please upload some images with the data!',
                        ErrorCodes.APIError
                    )
                );
        }

        const files: File[] = Array.isArray(req.files)
            ? req.files
            : Object.values(req.files).flat();

        const uploadUrls: string[] = [];

        files.map(async (file) => {
            const { imageURL } = await cloudinaryInstance.uploadImage(
                file.path
            );
            if (imageURL) {
                uploadUrls.push(imageURL);
            }
        });

        const imageUrls = await uploadUrls;

        const listing: NewListing = {
            name,
            location,
            county,
            size,
            status,
            userId,
            yearBuilt,
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

        const listingValidation = NewListingSchema.safeParse(listing);
        const ratesValidation = NewRateSchema.safeParse(rates);
        const compartmentsValidation =
            NewCompartmentSchema.safeParse(compartments);

        if (!listingValidation.success) {
            const error_formatted = listingValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        } else if (!ratesValidation.success) {
            const error_formatted = ratesValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        } else if (!compartmentsValidation.success) {
            const error_formatted = compartmentsValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        }

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
    try {
        const { listingId } = req.body;

        const userId: string = (req.user as JWTUserPayload).id;

        const listingValidation = listingIdSchema.safeParse(listingId);

        if (!listingValidation.success) {
            const error_formatted = listingValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        }

        const listing_to_delete = await listingRepository.deleteListing(
            listingId,
            userId
        );

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Successfully deleted listing!',
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
    try {
        const {
            listingId,
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
        } = req.body;

        const userId: string = (req.user as JWTUserPayload).id;

        const listingIdValidation = listingIdSchema.safeParse(listingId);
        const ratesIdValidation = ratesIdSchema.safeParse(ratesId);
        const compartmentIdValidation = listingId.safeParse(compartmentsId);

        if (!listingIdValidation.success) {
            const error_formatted = listingIdValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        } else if (!ratesIdValidation.success) {
            const error_formatted = ratesIdValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        } else if (!compartmentIdValidation.success) {
            const error_formatted = compartmentIdValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
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
            return res
                .status(400)
                .json(createErrorResponse('No updates to make!'));
        }

        const updateValidation = updateListingSchema.safeParse(updates);

        if (!updateValidation.success) {
            const error_formatted = updateValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        }

        const user_listing = await listingRepository.findListingById(listingId);

        // Ensure user can only update their listing and not others!
        if (user_listing.userId !== userId) {
            return next(
                new UnauthorizedError(
                    'You can only update listing that you have created!'
                )
            );
        }

        const result = await listingRepository.updateListing(
            listingId,
            userId,
            updates
        );

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

        const listingsData = {
            listings,
            count: listings.length
        };
        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Succesfully retrieved listings!',
                    listingsData
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
    try {
        const { Id } = req.body;
        const idValidation = userIdSchema.safeParse(Id);

        if (!idValidation.success) {
            const error_formatted = idValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        }

        const listing = await listingRepository.findListingById(Id);

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
    try {
        const { filters }: { filters: Filters } = req.body;
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
router.put('/user/listings', verifyJWTToken, updateListing);
router.delete('/user/listings', verifyJWTToken, deleteListing);
router.post('/user/listings', multi_upload, verifyJWTToken, createUserListing);

export default router;
