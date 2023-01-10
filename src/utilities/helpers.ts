import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Ipayload } from '../interfaces';

const secretKey = 'kikao';

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

    // Compare the decrypted password with the original encrypted password
    return decryptedPasswordHex === encryptedPassword;
}

export async function signToken(payload: Ipayload) {
    if (!payload) {
        return;
    }
    return await jwt.sign(payload, secretKey, {
        algorithm: 'HS256',
        expiresIn: '8h'
    });
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-access-token'] as string;
    if (!token) {
        return res
            .status(401)
            .send({ auth: false, message: 'No token provided.' });
    }

    try {
        jwt.verify(token, secretKey, {
            algorithms: ['HS256']
        });
        return next();
    } catch (error) {
        return res.status(400).json({ auth: false, message: error });
    }
}
