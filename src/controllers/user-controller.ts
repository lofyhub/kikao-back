import { NextFunction, Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { verifyToken } from '../utilities/helpers';
import { houseSchema } from '../interfaces';

const router = Router();

async function getListingPublisher(req: Request, res: Response) {
    const { _id } = req.body;
    if (!_id) {
        return res.status(403).json({ mesage: 'Id is required' });
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
        const user = {
            _id: existingUser?._id,
            username: existingUser?.username,
            email: existingUser?.email,
            regDate: existingUser?.date,
            kikaoType: existingUser?.kikaoType
        };

        return res.status(200).json({ message: 'Successful', data: user });
    } catch (error) {
        return res.status(400).json({ message: 'Request was not successful' });
    }
}

async function getUserListings(req: Request, res: Response) {
    const { Id } = req.body;
    if (!Id) {
        return res.status(400).json({ message: 'Id is required!' });
    }
    // sanitize the user input
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

        if (count === 0) {
            console.log('No documents found!');
        }

        return res
            .status(200)
            .json({ message: 'Successful', data: userListings, count });
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .json({ message: 'Request was not successful', error: error });
    }
}

async function addFavourite(req: Request, res: Response, next: NextFunction) {
    try {
        const { Id, userid } = req.body;
        const userId = userid;
        if (!Id || !userId) {
            return res
                .status(309)
                .json({ message: 'Id and userId are required' });
        }

        const collection = await mongoose.connection.db.collection('bookmarks');
        const bookmarkUser = await collection.findOne({ userId });

        let newBookmarks;
        if (!bookmarkUser) {
            newBookmarks = [Id];
            await collection.insertOne({ userId, bookmarks: newBookmarks });
        } else {
            for (const book of bookmarkUser.bookmarks) {
                if (book === Id) {
                    return res.status(403).json({
                        message: 'Listing already added as Bookmark'
                    });
                }
            }
            newBookmarks = [...bookmarkUser.bookmarks, Id];
            const { modifiedCount } = await collection.updateOne(
                { userId },
                { $set: { bookmarks: newBookmarks } }
            );
            if (!modifiedCount) {
                return res
                    .status(404)
                    .json({ message: 'Bookmark update was not successful' });
            }
        }

        return res
            .status(200)
            .json({ message: 'Bookmark request was successful' });
    } catch (error) {
        next(error);
        return;
    }
}

async function fetchBookmarks(req: Request, res: Response, next: NextFunction) {
    const { userid } = req.body;
    const userId: string = userid as string;
    if (!userId) {
        return res.status(309).json({ message: 'userId is required' });
    }
    try {
        const collection = await mongoose.connection.db.collection('bookmarks');
        const bookmarks = await collection.find({ userId }).toArray();
        return res.status(200).json({ bookmarks });
    } catch (error) {
        next(error);
        return;
    }
}

async function deleteBookmark(req: Request, res: Response, next: NextFunction) {
    const { userid, Id } = req.body;
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
        const isDeleted = await collection.updateOne(
            { userId: userid },
            { $set: updates }
        );
        if (isDeleted.modifiedCount === 0) {
            return res
                .status(309)
                .json({ message: 'Bookmark was not successful, Id not found' });
        }
        return res
            .status(200)
            .json({ message: 'Successfully removed listing from bookmarks' });
    } catch (error: unknown) {
        next(error);
        return;
    }
}

// Routes
router.post('/listing/author', verifyToken, getListingPublisher);
router.post('/author/listings', verifyToken, getUserListings);
router.post('/bookmarks', verifyToken, addFavourite);
router.post('/user/bookmarks', verifyToken, fetchBookmarks);
router.post('/delete/bookmarks', verifyToken, deleteBookmark);

export default router;
