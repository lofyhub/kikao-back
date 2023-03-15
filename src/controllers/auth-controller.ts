import { NextFunction, Request, Response, Router } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import { hashPassword, comparePassword } from '../utilities/helpers';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import {
    multerStorage,
    fileFilter,
    fileSizeLimitErrorHandler,
    signToken
} from '../utilities/helpers';
import { Ipayload, IUser } from '../interfaces';
import { nanoid } from 'nanoid';
import { cloudinaryInstance } from '../utilities/cloudinary';
import { validateFormFields, validateSignInFields } from '../utilities/zod';
const uri =
    'mongodb+srv://kikao:9zmZyT0ZMcTActQV@kikao.vsuckcx.mongodb.net/?retryWrites=true&w=majority';

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
} as ConnectOptions;

mongoose.set('strictQuery', true);

mongoose.connect(uri, options);

const router = Router();

const upload = multer({
    storage: multerStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 1
    }
});

async function signUp(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            email,
            password,
            username,
            kikaotype,
            businesname,
            location,
            phone,
            businessType,
            city
        } = req.body;
        await validateFormFields(req.body);
        const date = new Date();
        const hashedPass = await hashPassword(password);
        //TODO: not sure if we should hash the phone number too, what's you think 🤔 ?
        const userId = nanoid();

        const collection = await mongoose.connection.db.collection('kikao');
        const existingUserByEmail = await collection.findOne({ email: email });
        const existingUserByPhone = await collection.findOne({ phone: phone });

        if (existingUserByEmail) {
            return res.status(400).json({
                message: 'Email is already registered'
            });
        }

        if (existingUserByPhone) {
            return res.status(400).json({
                message: 'Phone number is already registered'
            });
        }
        let avatarUrl = '';

        if (req.file) {
            const { imageURL } = await cloudinaryInstance.uploadImage(
                req.file.path
            );
            if (imageURL) {
                avatarUrl = imageURL;
            }
        }

        const userItem: IUser = {
            userId: userId,
            username: username,
            email: email,
            kikaoType: kikaotype,
            password: hashedPass,
            profileImage: avatarUrl,
            date: date,
            phone: phone,
            business: {
                name: !businesname ? username : businesname,
                location: !location ? '' : location,
                businessType: !businessType ? '' : kikaotype,
                city: !city ? '' : city
            }
        };
        const result = await collection.insertOne(userItem);
        if (!result.acknowledged) {
            return res.status(400).json({
                message: 'Error saving new user to the database'
            });
        }

        return res.status(200).json({ message: 'Sign up is successful' });
    } catch (error) {
        return next(error);
    }
}

async function signIn(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        await validateSignInFields(req.body);
        const collection = await mongoose.connection.db.collection('kikao');
        const existingUser = await collection.findOne({ email: email });
        if (existingUser === null) {
            return res.status(404).json({ error: 'Wrong email address' });
        }
        const isPasswordValid = await comparePassword(
            password,
            existingUser.password
        );
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Incorrect password'
            });
        }

        const payload: Ipayload = {
            userId: existingUser.userId,
            email: email
        };

        const token = await signToken(payload);

        // exclude sensitive data to send to client i.e hashedpassword
        const user = {
            _id: existingUser._id,
            userId: existingUser.userId,
            username: existingUser.username,
            email: existingUser.email,
            regDate: existingUser.date,
            kikaotype: existingUser.kikaoType,
            telNumber: existingUser.phone
        };
        return res
            .status(200)
            .json({ auth: true, token: token, user: { ...user } });
    } catch (error) {
        next(error);
        return;
    }
}
// Routes

router.post(
    '/signup',
    rateLimit({
        windowMs: 1000,
        max: 1
    }),
    upload.single('avatarimage'),
    fileSizeLimitErrorHandler,
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
