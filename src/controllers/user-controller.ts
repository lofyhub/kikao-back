import { NextFunction, Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { verifyToken } from '../middlewares/verifyToken';
import { houseSchema, UserPublisherWithoutPassword } from '../interfaces';

const router = Router();

async function getListingAuthor(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { _id } = req.body;
    if (!_id) {
        return res.status(403).json({ mesage: 'Id is required' });
    }

    if (typeof _id !== 'string') {
        throw new Error('Id should be a string!');
    }
    try {
        const collection = await mongoose.connection.db.collection('kikao');
        const existingUser = await collection.findOne({
            userId: _id
        });
        // exclude sensitive data to send to client i.e hashedpassword - decide later on safety of emails
        if (!existingUser) {
            return res.status(300).json({
                message: 'Listing author with the given ID was not found'
            });
        }
        const user: UserPublisherWithoutPassword = {
            _id: existingUser._id,
            username: existingUser.username,
            userId: existingUser.userId,
            email: existingUser.email,
            kikaoType: existingUser.kikaoType,
            date: existingUser.date,
            profileImage: existingUser.profileImage,
            phone: existingUser.phone,
            business: {
                name: existingUser.business.name,
                location: existingUser.business.location,
                businessType: existingUser.business.businessType,
                city: existingUser.business.city
            }
        };
        return res.status(200).json({ message: 'Successful', data: user });
    } catch (error) {
        return next(error);
    }
}

async function getUserListings(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { Id } = req.body;
    if (!Id) {
        res.status(400).json({ message: 'Id is required!' });
        return;
    }
    const id = sanitize(Id);

    const query = {
        userId: id
    };

    try {
        const collection = await mongoose.connection.db.collection('listing');
        const userListings = await collection
            .find<houseSchema>(query)
            .toArray();
        const count = userListings.length;
        return res.status(200).json({
            message: 'Successful',
            data: userListings,
            count
        });
    } catch (error) {
        next(error);
        return;
    }
}

async function addFavourite(req: Request, res: Response, next: NextFunction) {
    const { Id, userid } = req.body;
    const userId = userid;
    if (!Id || !userId) {
        res.status(309).json({ message: 'Id and userId are required' });
        return;
    }

    try {
        const collection = await mongoose.connection.db.collection('bookmarks');
        const bookmarkUser = await collection.findOne({ userId });

        let newBookmarks;
        if (!bookmarkUser) {
            newBookmarks = [Id];
            await collection.insertOne({ userId, bookmarks: newBookmarks });
            return;
        }
        for (const bookmark of bookmarkUser.bookmarks) {
            if (bookmark === Id) {
                res.status(403).json({
                    message: 'Listing already added as Bookmark'
                });
                return;
            }
        }
        newBookmarks = [...bookmarkUser.bookmarks, Id];
        const { modifiedCount } = await collection.updateOne(
            { userId },
            { $set: { bookmarks: newBookmarks } }
        );
        if (!modifiedCount) {
            res.status(404).json({
                message: 'Bookmark update was not successful'
            });
            return;
        }

        res.status(200).json({ message: 'Bookmark request was successful' });
        return;
    } catch (error) {
        next(error);
        return;
    }
}

async function fetchBookmarks(req: Request, res: Response, next: NextFunction) {
    const { userid } = req.body;
    if (!userid) {
        res.status(309).json({ message: 'userId is required' });
        return;
    }
    if (typeof userid !== 'string') {
        throw new Error('Userid should be a string');
    }
    const userId: string = userid;
    try {
        const collection = await mongoose.connection.db.collection('bookmarks');
        const bookmarks = await collection.find({ userId }).toArray();
        res.status(200).json({ bookmarks });
        return;
    } catch (error) {
        next(error);
        return;
    }
}

async function deleteBookmark(req: Request, res: Response, next: NextFunction) {
    const { userid, Id } = req.body;
    if (!userid || !Id) {
        res.status(400).json({ message: 'UserId and Id are required' });
        return;
    }
    const collection = await mongoose.connection.db.collection('bookmarks');
    const dbUser = await collection.findOne({ userId: userid });
    let bookmarks;
    if (dbUser) {
        bookmarks = dbUser.bookmarks;
    }
    try {
        // TODO: Handle scenario where bookmarkId is not in the bookmarks.
        const newBookmarks = bookmarks.filter((item: string) => item !== Id);
        const updates = {
            bookmarks: newBookmarks
        };
        const isUpdated = await collection.updateOne(
            { userId: userid },
            { $set: updates }
        );
        if (isUpdated.modifiedCount === 0) {
            res.status(309).json({
                message: 'Bookmark was not successful'
            });
            return;
        }
        res.status(200).json({
            message: 'Successfully removed listing from your bookmarks'
        });
        return;
    } catch (error) {
        next(error);
        return;
    }
}

// Routes
router.post('/listing/author', getListingAuthor);
router.post('/author/listings', getUserListings);
router.post('/bookmarks', verifyToken, addFavourite);
router.post('/user/bookmarks', verifyToken, fetchBookmarks);
router.post('/delete/bookmarks', verifyToken, deleteBookmark);

export default router;
