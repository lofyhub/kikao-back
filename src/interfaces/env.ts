export interface EnvVariables {
    PORT: number;
    debug: boolean;
    IMAGE_UPLOAD_SIZE_LIMIT: number;
    FRONTEND_APP_LOGIN_REDIRECT: string;
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
}