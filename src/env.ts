import dotenv from 'dotenv';

dotenv.config();

/** HERE YOU CAN ADD ALL YOUR ENVIRONMENT VARIABLES */
const DEBUG = process.env.DEBUG || false;
if (DEBUG) {
    console.log('DEBUG ENABLED');
}

const PORT = process.env.PORT || 9000;
const ATLAS_URI = process.env.ATLAS_URI || '';
const testMode = process.env.TEST_MODE;

// Make sure to add your env variables to this object so that they are exported to the rest of the application
const env = {
    port: PORT,
    debug: DEBUG,
    ATLAS_URI: ATLAS_URI,
    testMode: testMode
};

export default env;
