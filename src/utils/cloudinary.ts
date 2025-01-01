import { v2 as cloudinary } from 'cloudinary';
import { unlinkSync } from 'fs';
import env from '../env';
import { ICloudinary, ICloudinaryResponse } from '../interfaces/index';

export class Cloudinary implements ICloudinary {
    constructor() {
        cloudinary.config({
            cloud_name: env.CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            api_secret: env.CLOUDINARY_API_SECRET
        });
    }

    uploadImage = async (
        imageToUpload: string
    ): Promise<ICloudinaryResponse> => {
        try {
            const cloudinaryImageUploadResponse =
                await cloudinary.uploader.upload(imageToUpload, {
                    public_id: process.env.CLOUDINARY_CLOUD_NAME
                });

            const { url } = cloudinaryImageUploadResponse;

            if (!url) {
                unlinkSync(imageToUpload);
                return {
                    isSuccess: false,
                    message:
                        "Couldn't upload your image at the moment. Please try again later.",
                    statusCode: 400
                };
            }

            unlinkSync(imageToUpload);
            return {
                isSuccess: true,
                message: 'Successfully uploaded image.',
                statusCode: 200,
                imageURL: url
            };
        } catch (error) {
            unlinkSync(imageToUpload);
            return {
                isSuccess: false,
                message: 'Internal Server Error',
                statusCode: 500
            };
        }
    };
}

export const cloudinaryInstance = new Cloudinary();
