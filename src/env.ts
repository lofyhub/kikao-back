import { EnvVariables } from './interfaces/env';

/** HERE YOU CAN ADD ALL YOUR ENVIRONMENT VARIABLES */
const DEBUG = process.env.DEBUG || true;
if (DEBUG) {
    console.log('DEBUG ENABLED');
}

const PORT = process.env.PORT || 9000;
const TEST_MODE = process.env.TEST_MODE;
const IMAGE_UPLOAD_SIZE_LIMIT = process.env.IMAGE_UPLOAD_SIZE_LIMIT;
const OPENAI_API_KEY = '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';
const CLOUD_NAME = 'deye3gicq';
const CLOUDINARY_API_KEY = '824696885955381';
const CLOUDINARY_API_SECRET = 'rRS6znH_5wvEhcZzUYZNqi7zXt0';
const CLOUDINARY_API_ENV =
    'CLOUDINARY_URL=cloudinary://824696885955381:rRS6znH_5wvEhcZzUYZNqi7zXt0@deye3gicq';
const SECRET = 'another_private_secret_seriously';
const GOOGLE_CLIENT_ID =
    process.env.GOOGLE_CLIENT_ID ||
    '518559658778-c2p6o5vmg7avqdqkghtd5p8nsa2keb3o.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET =
    process.env.GOOGLE_CLIENT_SECRET || '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';
const GOOGLE_CALLBACK_URL =
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:3000/oauth2/redirect/google';
const DATABASE_URL = 'postgres://postgres:Monica@7029!@localhost:5432/kikao';
const JWT_SECRET = process.env.JWT_SECRET || 'ChiziKarogwaTena';
const NODE_ENV =
    (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
    'development';
const FRONTEND_APP_LOGIN_REDIRECT =
    process.env.FRONTEND_APP_LOGIN_REDIRECT ||
    'http://localhost:9001/login/success';
const GOOGLE_APP_OAUTH_REDIRECT =
    process.env.GOOGLE_APP_OAUTH_REDIRECT ||
    'http://localhost:9000/api/v1/oauth/google/callback';

// Make sure to add your env variables to this object so that they are exported to the rest of the application
const env: EnvVariables = {
    PORT: Number(PORT),
    debug: Boolean(DEBUG),
    IMAGE_UPLOAD_SIZE_LIMIT: Number(IMAGE_UPLOAD_SIZE_LIMIT!),
    FRONTEND_APP_LOGIN_REDIRECT: FRONTEND_APP_LOGIN_REDIRECT,
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
    GOOGLE_CALLBACK_URL: GOOGLE_CALLBACK_URL
};

export default env;
