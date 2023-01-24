import { NextFunction, Request, Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import rateLimiter from '../middlewares/rate_limit';
import { houseSchema } from '../interfaces';
import { verifyToken } from '../utilities/helpers';
import multer from 'multer';
import { nanoid } from 'nanoid';

const router = Router();
const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req: Request, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (
    req: Request,
    file: { mimetype: string },
    cb: (arg0: null, arg1: boolean) => void
) => {
    // filter filetype to store
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

async function getListings(req: Request, res: Response, next: NextFunction) {
    try {
        const collection = await mongoose.connection.db.collection('listing');
        const listings = await collection.find({}).toArray();
        return res.status(200).json({ listings });
    } catch (error) {
        next(error);
        return;
    }
}

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
        status
    } = req.body;
    const imgPath = req.file?.path as string;
    if (
        !title ||
        !Id ||
        !location ||
        !price ||
        !duration ||
        !bedrooms ||
        !totalrooms ||
        !washrooms ||
        !parking ||
        !size ||
        !status
    ) {
        return res.status(400).json({
            message: 'Your provided incorrect credentials'
        });
    }

    const listingId = nanoid();
    const timestamp = new Date();
    // TODO: Better verification of what is sent by the user
    const listing: houseSchema = {
        id: listingId,
        userId: Id,
        name: title,
        location: location,
        images: [imgPath],
        rate: {
            price: JSON.parse(price),
            duration: duration,
            countryCode: 'kshs'
        },
        compartments: {
            bedrooms: JSON.parse(bedrooms),
            totalRooms: JSON.parse(totalrooms),
            washRooms: JSON.parse(washrooms),
            parking: JSON.parse(parking)
        },
        size: JSON.parse(size),
        createdAt: timestamp,
        status: status
    };

    try {
        const collection = await mongoose.connection.db.collection('listing');
        const result = await collection.insertOne(listing);

        return res.status(200).json({ result });
    } catch (error) {
        next(error);
        return;
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
        next(error);
        return;
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
        const collection = mongoose.connection.db.collection('listing');
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

// Routes
router.get(
    '/listings',
    rateLimiter({
        windowMs: 1000,
        max: 1
    }),
    getListings
);
router.post(
    '/user/listings',
    rateLimiter({ windowMs: 1000, max: 1 }),
    verifyToken,
    upload.single('kikaoimage'),
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

export default router;
