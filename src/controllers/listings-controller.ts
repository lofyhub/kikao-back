import { NextFunction, Request, Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import rateLimiter from '../middlewares/rate_limit';
import { houseSchema } from '../interfaces';
import { verifyToken } from '../utilities/helpers';

const router = Router();

async function getListings(req: Request, res: Response, next: NextFunction) {
    try {
        const collection = mongoose.connection.db.collection('listing');
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
    const { id, name, location, images, rate, compartments, size, status } =
        req.body;
    const timestamp = new Date();

    if (
        !id ||
        !name ||
        !location ||
        !images ||
        !rate ||
        !compartments ||
        !size ||
        !status
    ) {
        return res.status(400).json({
            message: 'Your provided incorrect credentials'
        });
    }

    const listing: houseSchema = {
        id: id,
        name: name,
        location: location,
        images: images,
        rate: rate,
        compartments: compartments,
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
    const { userId, _id } = req.body;

    const collection = await mongoose.connection.db.collection('listing');
    const dbUser = await collection.findOne({ _id: new ObjectId(_id) });
    // TODO: A better way to verify user deletion
    if (dbUser?.id !== userId) {
        return res.status(403).json({
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
    // TODO: A better way to verify user deletion
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
router.post('/user/listings', verifyToken, createUserListing);
router.put('/user/listings', verifyToken, updateListing);
router.delete('/user/listings', verifyToken, deleteListing);

export default router;
