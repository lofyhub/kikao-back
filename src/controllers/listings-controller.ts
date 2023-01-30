import { NextFunction, Request, Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import rateLimiter from '../middlewares/rate_limit';
import { houseSchema } from '../interfaces';
import { verifyToken } from '../utilities/helpers';
import multer from 'multer';
import { nanoid } from 'nanoid';

const router = Router();
const storage = multer.memoryStorage();

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
        county
    } = req.body;
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
        !status ||
        !county
    ) {
        return res.status(400).json({
            message: 'Your provided incorrect credentials'
        });
    }
    let images: any[] = [];
    // create an array of image upload promises
    if (req.files) {
        images = (req.files as Array<any>).map((file: any) => {
            return {
                data: file.buffer,
                contentType: file.mimetype,
                fileName: Date.now() + file.originalname.toLowerCase()
            };
        });
    }
    // use Promise.all to wait for all the image uploads to complete
    const imageUploadPromises = await Promise.all(images);
    console.log(imageUploadPromises);
    const listingId = nanoid();
    const timestamp = new Date();
    // TODO: Better verification of what is sent by the user
    const listing: houseSchema = {
        id: listingId,
        userId: Id,
        name: title,
        location: location,
        county: county,
        images: imageUploadPromises,
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
        size: size,
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
        return res.status(200).json({ listings });
    } catch (error) {
        next(error);
        return;
    }
}

// Routes
router.get('/listings', getListings);
router.post(
    '/user/listings',
    rateLimiter({ windowMs: 1000, max: 1 }),
    verifyToken,
    multi_upload.array('kikaoimage', 4),
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
