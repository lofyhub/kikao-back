import { NextFunction, Request, Response, Router } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import { hashPassword, comparePassword } from '../utilities/helpers';
import { rateLimit } from 'express-rate-limit';
import { signToken } from '../utilities/helpers';
import { Ipayload, IUser } from '../interfaces';

import regex from '../config/regex';

const uri =
    'mongodb+srv://kikao:9zmZyT0ZMcTActQV@kikao.vsuckcx.mongodb.net/?retryWrites=true&w=majority';

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
} as ConnectOptions;

mongoose.set('strictQuery', true);

mongoose.connect(uri, options);

const router = Router();

async function signUp(req: Request, res: Response, next: NextFunction) {
    const { email, password, username } = req.body;
    const date = new Date();

    const isvalidEmail = regex.emailRegex.test(email);
    const validPass = regex.passWord.test(password);
    const validName = regex.userName.test(username);

    if (!isvalidEmail || !validName || !validPass) {
        res.status(400).json({
            message: 'Your provided incorrect credentials'
        });
        return;
    }
    const hashedPass = await hashPassword(password);

    const userItem: IUser = {
        username: username,
        email: email,
        password: hashedPass,
        date: date
    };

    try {
        const collection = mongoose.connection.db.collection('kikao');
        const existingUser = await collection.findOne({ email: email });

        if (existingUser) {
            res.status(400).json({
                message: 'Email is already registered'
            });
        } else {
            collection
                .insertOne(userItem)
                .then((result) => {
                    console.log('Successfully saved new user to the database');
                    res.status(200).json({ result });
                })
                .catch((error) => {
                    res.status(400).json({
                        'Error saving new user to the database:': error
                    });
                });
        }
    } catch (error) {
        next(error);
        return;
    }
}

async function signIn(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    const validEmail = regex.emailRegex.test(email);

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: 'Email and password are required' });
    }

    if (validEmail) {
        try {
            const collection = await mongoose.connection.db.collection('kikao');
            const existingUser = await collection.findOne({ email: email });

            const isPasswordValid = await comparePassword(
                password,
                existingUser?.password
            );
            const payload: Ipayload = {
                userId: existingUser?.username,
                email: email
            };
            const token = await signToken(payload);

            if (isPasswordValid) {
                return res.status(200).json({ auth: true, token: token });
            } else {
                return res
                    .status(401)
                    .json({ message: 'Incorrect email or password' });
            }
        } catch (error) {
            next(error);
            return;
        }
    }

    return res
        .status(500)
        .json({ message: 'Email and password provided is not valid' });
}
// Routes

router.post(
    '/signup',
    rateLimit({
        windowMs: 1000,
        max: 1
    }),
    signUp
);
router.post(
    '/signin',
    rateLimit({
        windowMs: 1000,
        max: 1
    }),
    signIn
);

export default router;
