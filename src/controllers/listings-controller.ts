import { NextFunction, Request, Response, Router } from 'express';
import { ObjectId, GridFSBucketReadStream } from 'mongodb';
import mongoose from 'mongoose';
import rateLimiter from '../middlewares/rate_limit';
import { houseSchema } from '../interfaces';
import { verifyToken } from '../middlewares/verifyToken';
import { check, validationResult } from 'express-validator';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { Readable } from 'stream';

const router = Router();
const storage = multer.memoryStorage();

const fileSizeLimitErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err) {
        if (err instanceof multer.MulterError) {
            return res.status(418).json({ error: err.message });
        }

        // Check for file size limit exceeded error
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File size limit exceeded' });
        }

        // Check for total size limit exceeded error
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(413).json({ error: 'Total size limit exceeded' });
        }

        return res.status(500).json({ error: 'Server error' });
    }

    return next();
};

const fileFilter = (
    req: Request,
    file: { mimetype: string },
    cb: (arg0: null, arg1: boolean) => void
) => {
    // filter filetype to store
    if (
        file.mimetype == 'image/png' ||
        file.mimetype == 'image/jpg' ||
        file.mimetype == 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const multi_upload = multer({
    storage: storage,
    limits: {
        // 1MB
        fileSize: 1024 * 1024 * 1
    },
    fileFilter: fileFilter
});

async function createUserListing(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
        // If no file was sent, return an error response
        return res
            .status(400)
            .json({ error: 'Please select an image to upload' });
    }

    const {
        Id,
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
        year
    } = req.body;

    // TODO: Ensure a user can only post a listing with his Id and not anyone elses

    // Create a new GridFSBucket instance
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'images'
    });

    // create an array of image upload promises
    const imageUploadPromises = (req.files as Array<any>).map((file: any) => {
        const readable = new Readable();
        readable._read = () => {};
        readable.push(file.buffer);
        readable.push(null);

        const uploadStream = bucket.openUploadStream(file.originalname, {
            metadata: {
                contentType: file.mimetype
            }
        });

        return new Promise((resolve, reject) => {
            readable
                .pipe(uploadStream)
                .on('error', reject)
                .on('finish', () => {
                    resolve(uploadStream.id);
                });
        });
    });

    // wait for all the image uploads to complete
    const imageIds = await Promise.all(imageUploadPromises);

    const listingId = nanoid();
    const timestamp = new Date();
    const listing: houseSchema = {
        id: listingId,
        userId: Id,
        name: title,
        location: location,
        county: county,
        images: imageIds.map((id: any) => new ObjectId(id)),
        rate: {
            price: JSON.parse(price),
            duration: duration,
            countryCode: 'kshs'
        },
        compartments: {
            bedrooms: JSON.parse(bedrooms),
            totalRooms: JSON.parse(totalrooms),
            washRooms: JSON.parse(washrooms),
            parking: JSON.parse(parking),
            roomNumber: JSON.parse(roomnumber),
            security: JSON.parse(security),
            WIFI: JSON.parse(wifi),
            garbageCollection: JSON.parse(garbagecollection)
        },
        size: size,
        createdAt: timestamp,
        status: status,
        yearBuild: year,
        description: description
    };
    try {
        const collection = await mongoose.connection.db.collection('listing');
        const result = await collection.insertOne(listing);

        return res.status(200).json({ message: 'Successful', ...result });
    } catch (error) {
        return next(error);
    }
}

async function deleteListing(req: Request, res: Response, next: NextFunction) {
    const { accountId, _id } = req.body;
    const collection = await mongoose.connection.db.collection('listing');
    const dbUser = await collection.findOne({ _id: new ObjectId(_id) });
    // TODO: A better way to verify user deletion
    if (dbUser?.userId !== accountId) {
        return res.status(401).json({
            message:
                'Sorry, you are only able to delete listings that you have created'
        });
    }

    try {
        const collection = await mongoose.connection.db.collection('listing');
        const isDeleted = await collection.deleteOne({
            _id: new ObjectId(_id)
        });

        if (isDeleted.deletedCount === 0) {
            return res
                .status(404)
                .json({ message: 'Listing deletion was not successful' });
        }
        return res
            .status(200)
            .json({ message: 'Successfully deleted listing' });
    } catch (error: unknown) {
        return next(error);
    }
}

async function updateListing(req: Request, res: Response, next: NextFunction) {
    const { _id, name, location, status, userId } = req.body;

    const updates = {
        name: name,
        location: location,
        status: status
    };

    if (!_id) {
        return res.status(400).json({ message: 'Listing ID is required' });
    }

    // Don't proceed if there are no updates to make
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }
    const collection = await mongoose.connection.db.collection('listing');
    const dbUser = await collection.findOne({ _id: new ObjectId(_id) });
    // TODO: A better way to verify the user updating the listing
    if (dbUser?.id !== userId) {
        return res.status(403).json({
            message:
                'Sorry, you are only able to edit listings that you have created'
        });
    }

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updates }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                message: 'Listing update was not successful'
            });
        }
        return res.status(200).json({ result });
    } catch (error) {
        return next(error);
    }
}

async function getListings(req: Request, res: Response, next: NextFunction) {
    try {
        const collection = await mongoose.connection.db.collection('listing');
        const listings = await collection.find({}).toArray();

        // Create a new GridFSBucket instance
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'images'
        });

        // Retrieve image data for each listing
        const listingsWithImages = await Promise.all(
            listings.map(async (listing) => {
                const imageIds = listing.images.map(
                    (id: any) => new mongoose.Types.ObjectId(id)
                );

                const images = await bucket
                    .find({ _id: { $in: imageIds } })
                    .toArray();

                const imageData = await Promise.all(
                    images.map(async (image: any) => {
                        const readStream = bucket.openDownloadStream(image._id);
                        const data = await streamToBase64(readStream);
                        return {
                            filename: image.filename,
                            contentType: image.metadata.contentType,
                            data
                        };
                    })
                );

                return {
                    ...listing,
                    images: imageData
                };
            })
        );

        res.status(200).json({ listings: listingsWithImages });
        return;
    } catch (error) {
        return next(error);
    }
}

// Helper function to convert a GridFSBucketReadStream to a base64-encoded string
function streamToBase64(stream: GridFSBucketReadStream): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];

        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const data = buffer.toString('base64');
            resolve(data);
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}

async function getListing(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;
    try {
        const collection = await mongoose.connection.db.collection('listing');
        const listing = await collection.findOne({ _id: new ObjectId(id) });
        return res.status(200).json({ listing });
    } catch (error) {
        return next(error);
    }
}

async function filterListings(req: Request, res: Response, next: NextFunction) {
    const { filters } = req.body;
    try {
        const collection = await mongoose.connection.db.collection('listing');
        const listings = await collection.find({}).toArray();
        const filteredListings = listings.filter((house) => {
            return (
                (filters.price === undefined ||
                    house.rate.price <= filters.price) &&
                (filters.county === undefined ||
                    house.county === filters.county) &&
                (filters.propertyType === undefined ||
                    house.size === filters.size)
            );
        });
        return res.status(200).json({ listings: filteredListings });
    } catch (error) {
        return next(error);
    }
}

// Routes
router.get('/listings', getListings);
router.post(
    '/user/listings',
    rateLimiter({ windowMs: 1000, max: 1 }),
    verifyToken,
    multi_upload.array('kikaoimage', 4),
    fileSizeLimitErrorHandler,
    [
        check('title')
            .not()
            .isEmpty()
            .withMessage('Title should not be empty')
            .trim()
            .isLength({ min: 4 })
            .withMessage('Title must be at least 4 characters long'),
        check('Id')
            .not()
            .isEmpty()
            .withMessage('Id should not be empty')
            .trim()
            .isLength({ min: 10 }),
        check('location')
            .not()
            .isEmpty()
            .withMessage('Location should not be empty')
            .trim()
            .isLength({ min: 4 })
            .withMessage('Location must be at least 4 characters long'),
        check('price')
            .not()
            .isEmpty()
            .withMessage('Price should not be empty')
            .isNumeric()
            .withMessage('Price must be a number'),

        check('bedrooms')
            .not()
            .isEmpty()
            .withMessage('Bedrooms should not be empty')
            .trim(),

        check('duration')
            .not()
            .isEmpty()
            .withMessage('Duration should not be empty')
            .trim(),

        check('size')
            .not()
            .isEmpty()
            .withMessage('Size should not be empty')
            .trim(),

        check('washrooms')
            .not()
            .isEmpty()
            .withMessage('Washrooms should not be empty')
            .isNumeric()
            .withMessage('Washrooms must be a number'),

        check('totalrooms')
            .not()
            .isEmpty()
            .withMessage('Total rooms should not be empty')
            .trim()
            .isNumeric()
            .withMessage('Total rooms must be a number'),

        check('county')
            .not()
            .isEmpty()
            .withMessage('County should not be empty')
            .trim()
            .isLength({ min: 4 })
            .withMessage('County must be at least 4 characters long'),
        check('parking')
            .not()
            .isEmpty()
            .withMessage('Parking should not be empty')
            .isBoolean()
            .withMessage('Parking must be a boolean'),

        check('wifi')
            .not()
            .isEmpty()
            .withMessage('WIFI should not be empty')
            .isBoolean()
            .withMessage('WIFI must be a boolean'),

        check('garbagecollection')
            .not()
            .isEmpty()
            .withMessage('Garbage collection should not be empty')
            .isBoolean()
            .withMessage('Garbage collection must be a boolean'),

        check('roomnumber')
            .not()
            .isEmpty()
            .withMessage('Room number should not be empty')
            .isBoolean()
            .withMessage('Room number must be a boolean'),

        check('description')
            .not()
            .isEmpty()
            .withMessage('Description should not be empty')
            .trim()
            .isLength({ min: 20 })
            .withMessage('Description must be at least 20 characters long'),

        check('security')
            .not()
            .isEmpty()
            .withMessage('Security should not be empty')
            .isBoolean()
            .withMessage('Security must be a boolean'),
        check('year')
            .not()
            .isEmpty()
            .withMessage('Year should not be empty')
            .trim()
            .isLength({ max: 4 })
            .withMessage('Year must be 4 characters long')
            .custom((value) => !/\s/.test(value))
            .withMessage('No spaces are allowed in the username')
    ],
    createUserListing
);
router.put(
    '/user/listings',
    rateLimiter({ windowMs: 1000, max: 1 }),
    verifyToken,
    updateListing
);
router.delete(
    '/user/listings',
    rateLimiter({ windowMs: 1000, max: 1 }),
    verifyToken,
    deleteListing
);

router.post(
    '/user/listing',
    rateLimiter({ windowMs: 1000, max: 1 }),
    getListing
);

router.post(
    '/sort/listings',
    rateLimiter({ windowMs: 1000, max: 1 }),
    filterListings
);

export default router;
