import env from '../env';
import jwt from 'jsonwebtoken';
import { User } from '../db/schema';
import { IUser } from '../interfaces/user';

// The function to generate a JWT token

const options = {
    expiresIn: 604800 // 7 days in seconds
};
export function generateJWTToken(user: User): string {
    const { id, username, email, providerUserId, profileImage, provider } =
        user;

    const payload = {
        id,
        username,
        email,
        providerUserId,
        profileImage,
        provider
    };

    const token = jwt.sign(payload, env.JWT_SECRET, options);

    return token;
}

export function filterUserData(user_data: User): IUser {
    const {
        id,
        gender,
        username,
        kikaoType,
        profileImage,
        providerPictureUrl,
        businessName,
        businessLocation,
        businessType,
        businessCity,
        businessLogo,
        createdAt,
        updatedAt
    } = user_data;

    const filteredUser: IUser = {
        id,
        gender,
        username,
        kikaoType,
        profileImage,
        providerPictureUrl,
        businessName,
        businessLocation,
        businessType,
        businessCity,
        businessLogo,
        createdAt,
        updatedAt
    };

    return filteredUser;
}
