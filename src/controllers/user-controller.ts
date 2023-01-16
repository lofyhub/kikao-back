import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

import { verifyToken } from '../utilities/helpers';
import { ObjectId } from 'mongodb';
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
            _id: new ObjectId(_id)
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

// Routes
router.post('/listing/author', verifyToken, getListingPublisher);
router.post('/author/listings', verifyToken, getUserListings);

export default router;
