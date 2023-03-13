import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
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
    const signedJwt = await jwt.sign({ ...payload }, privateKey, {
        algorithm: 'RS256',
        expiresIn: '8h'
    });
    return signedJwt;
}

export const multerStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, __dirname);
    },

    filename: (request, file, callback) => {
        callback(null, file.originalname);
    }
});

export const fileSizeLimitErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err) {
        if (err instanceof multer.MulterError) {
            return res.status(418).json({ error: err.message });
        }

        // Check for file size limit exceeded error
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File size limit exceeded' });
        }

        // Check for total size limit exceeded error
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(413).json({ error: 'Total size limit exceeded' });
        }

        return res.status(500).json({ error: 'Server error' });
    }

    return next();
};

export const fileFilter = (
    req: Request,
    file: { mimetype: string },
    cb: (arg0: null, arg1: boolean) => void
) => {
    // filter filetype to store
    if (
        file.mimetype == 'image/png' ||
        file.mimetype == 'image/jpg' ||
        file.mimetype == 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
