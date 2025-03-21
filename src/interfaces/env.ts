import { z } from 'zod';
export interface EnvVariables {
    PORT: number;
    debug: boolean;
    IMAGE_UPLOAD_SIZE_LIMIT: number;

    FRONTEND_APP_LOGIN_FAILURE_REDIRECT: string;
    FRONTEND_APP_LOGIN_SUCCESS_REDIRECT: string;
    GOOGLE_APP_OAUTH_REDIRECT: string;
    TEST_MODE: boolean;
    OPENAI_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_API_KEY: string;
    CLOUD_NAME: string;
    CLOUDINARY_API_ENV: string;
    DATABASE_URL: string;
    SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    SAFARICOM_CONSUMER_KEY: string;
    SAFARICOM_CONSUMER_SECRET: string;
    SAFARICOM_LIPANAMPESA_CALLBACK: string;
    KCB_ACCCESS_TOKEN: string;
}

export const EnvVariableSchema = z.object({
    PORT: z.number(),
    debug: z.boolean(),
    IMAGE_UPLOAD_SIZE_LIMIT: z.number(),
    FRONTEND_APP_LOGIN_FAILURE_REDIRECT: z.string().nonempty(),
    FRONTEND_APP_LOGIN_SUCCESS_REDIRECT: z.string().nonempty(),
    GOOGLE_APP_OAUTH_REDIRECT: z.string().nonempty(),
    TEST_MODE: z.boolean(),
    OPENAI_API_KEY: z.string().nonempty(),
    CLOUDINARY_API_SECRET: z.string().nonempty(),
    CLOUDINARY_API_KEY: z.string().nonempty(),
    CLOUD_NAME: z.string().nonempty(),
    CLOUDINARY_API_ENV: z.string().nonempty(),
    DATABASE_URL: z.string().nonempty(),
    SECRET: z.string().nonempty(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    JWT_SECRET: z.string().nonempty(),
    GOOGLE_CLIENT_ID: z.string().nonempty(),
    GOOGLE_CLIENT_SECRET: z.string().nonempty(),
    GOOGLE_CALLBACK_URL: z.string().nonempty(),
    SAFARICOM_CONSUMER_KEY: z.string().nonempty(),
    SAFARICOM_CONSUMER_SECRET: z.string().nonempty(),
    SAFARICOM_LIPANAMPESA_CALLBACK: z.string().nonempty(),
    KCB_ACCCESS_TOKEN: z.string().nonempty()
});
