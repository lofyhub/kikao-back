import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Ipayload } from '../interfaces';
import env from '../env';

const privateKey = Buffer.from(env.PRIVATE_KEY, 'base64').toString('utf8');

export async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, 'salt', 64, (err, derivedKey) => {
            if (err) {
                reject(err);
            }

            resolve(derivedKey.toString('hex'));
        });
    });
}

export async function comparePassword(
    password: string,
    encryptedPassword: string
): Promise<boolean> {
    const decryptedPasswordHex = await hashPassword(password);
    return decryptedPasswordHex === encryptedPassword;
}

export async function signToken(payload: Ipayload): Promise<string> {
    if (!payload) {
        throw new Error('Paylod is required');
    }
    const signedJwt = await jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '8h'
    });
    return signedJwt;
}
