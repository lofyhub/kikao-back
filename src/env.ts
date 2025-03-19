import { EnvVariables, EnvVariableSchema } from './interfaces/env';
import dotenv from 'dotenv';

dotenv.config();

/** HERE YOU CAN ADD ALL YOUR ENVIRONMENT VARIABLES */
const DEBUG = process.env.DEBUG || true;
if (DEBUG) {
    console.log('DEBUG ENABLED');
}

const PORT = process.env.PORT!;
const TEST_MODE = process.env.TEST_MODE!;
const IMAGE_UPLOAD_SIZE_LIMIT = process.env.IMAGE_UPLOAD_SIZE_LIMIT!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const CLOUD_NAME = process.env.CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const CLOUDINARY_API_ENV = process.env.CLOUDINARY_API_ENV!;
const SECRET = process.env.SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;
const DATABASE_URL = process.env.DATABASE_URL!;
const JWT_SECRET = process.env.JWT_SECRET!;
const NODE_ENV =
    (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
    'development';
const FRONTEND_APP_LOGIN_SUCCESS_REDIRECT =
    process.env.FRONTEND_APP_LOGIN_SUCCESS_REDIRECT!;
const FRONTEND_APP_LOGIN_FAILURE_REDIRECT =
    process.env.FRONTEND_APP_LOGIN_FAILURE_REDIRECT!;
const GOOGLE_APP_OAUTH_REDIRECT = process.env.GOOGLE_APP_OAUTH_REDIRECT!;
const SAFARICOM_CONSUMER_KEY = process.env.SAFARICOM_CONSUMER_KEY!;
const SAFARICOM_CONSUMER_SECRET = process.env.SAFARICOM_CONSUMER_SECRET!;
const SAFARICOM_LIPANAMPESA_CALLBACK =
    process.env.SAFARICOM_LIPANAMPESA_CALLBACK!;

// Make sure to add your env variables to this object so that they are exported to the rest of the application
const env: EnvVariables = {
    PORT: Number(PORT),
    debug: Boolean(DEBUG),
    IMAGE_UPLOAD_SIZE_LIMIT: Number(IMAGE_UPLOAD_SIZE_LIMIT),
    FRONTEND_APP_LOGIN_SUCCESS_REDIRECT: FRONTEND_APP_LOGIN_SUCCESS_REDIRECT,
    FRONTEND_APP_LOGIN_FAILURE_REDIRECT: FRONTEND_APP_LOGIN_FAILURE_REDIRECT,

    GOOGLE_APP_OAUTH_REDIRECT: GOOGLE_APP_OAUTH_REDIRECT,
    TEST_MODE: Boolean(TEST_MODE),
    OPENAI_API_KEY: OPENAI_API_KEY,
    CLOUDINARY_API_SECRET: CLOUDINARY_API_SECRET,
    CLOUDINARY_API_KEY: CLOUDINARY_API_KEY,
    CLOUD_NAME: CLOUD_NAME,
    CLOUDINARY_API_ENV: CLOUDINARY_API_ENV,
    DATABASE_URL: DATABASE_URL,
    SECRET: SECRET,
    NODE_ENV: NODE_ENV,
    JWT_SECRET: JWT_SECRET,
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: GOOGLE_CALLBACK_URL,
    SAFARICOM_CONSUMER_KEY: SAFARICOM_CONSUMER_KEY,
    SAFARICOM_CONSUMER_SECRET: SAFARICOM_CONSUMER_SECRET,
    SAFARICOM_LIPANAMPESA_CALLBACK: SAFARICOM_LIPANAMPESA_CALLBACK
};

const validateEnv = EnvVariableSchema.safeParse(env);

if (!validateEnv.success) {
    const errors = validateEnv.error.format();
    console.log(`Error parsing env variables:`);
    console.log(errors);
}
export default env;
