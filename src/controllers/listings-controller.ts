import { NextFunction, Request, Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import rateLimiter from '../middlewares/rate_limit';
import { houseSchema, schema, File } from '../interfaces';
import { verifyToken } from '../middlewares/verifyToken';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { cloudinaryInstance } from '../utilities/cloudinary';

const router = Router();
const multerStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, __dirname);
    },

    filename: (request, file, callback) => {
        callback(null, file.originalname);
    }
});

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
    storage: multerStorage,
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
    // Parse the data and convert strings to numbers and booleans where appropriate
    const data = {
        Id: Id.trim(),
        title: title.trim(),
        location: location.trim(),
        price: parseFloat(price),
        duration: duration.trim(),
        bedrooms: bedrooms.trim(),
        totalrooms: parseInt(totalrooms),
        washrooms: parseInt(washrooms),
        parking: parking === 'true',
        size: size.trim(),
        county: county.trim(),
        description: description.trim(),
        wifi: wifi === 'true',
        security: security === 'true',
        garbagecollection: garbagecollection === 'true',
        roomnumber: roomnumber === 'true',
        year: year.trim()
    };
    const { success, ...error } = schema.safeParse(data);

    if (!success) {
        res.status(422).json({ error });
        return;
    }

    if (!req.files || req.files.length === 0) {
        // If no file was sent, return an error response
        return res
            .status(400)
            .json({ error: 'Please select an image to upload' });
    }

    try {
        // TODO: Ensure a user can only post a listing with his Id and not anyone elses
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

        const listingId = nanoid();
        const timestamp = new Date();
        const listing: houseSchema = {
            id: listingId,
            userId: Id,
            name: title,
            location: location,
            county: county,
            images: imageUrls,
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
        res.status(200).json({ listings });
        return;
    } catch (error) {
        return next(error);
    }
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
    multi_upload.array('kikaoimage', 8),
    fileSizeLimitErrorHandler,
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
