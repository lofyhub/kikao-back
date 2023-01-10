import dotenv from 'dotenv';
import app from './app';
import { connectToServer } from './config/db-config';

dotenv.config();

(async () => {
    app.listen(app.get('port'));
    connectToServer();
    console.log(`[Info] Server is listening on port ${app.get('port')}`);
})();
