import env from '../env';
import jwt from 'jsonwebtoken';
import { User } from '../db/schema';

// The function to generate a JWT token
export function generateJWTToken(user: User): string {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        providerID: user.providerUserId,
        profileImage: user.profileImage,
        provider: user.provider
    };

    const options = {
        expiresIn: '7d'
    };

    const token = jwt.sign(payload, env.JWT_SECRET, options);

    return token;
}
