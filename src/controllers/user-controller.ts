import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';

import { verifyToken } from '../utilities/helpers';
import { ObjectId } from 'mongodb';

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

// Routes
router.get('/author/listing', verifyToken, getListingPublisher);

export default router;
