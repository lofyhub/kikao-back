import dotenv from 'dotenv';
import app from './app';

dotenv.config();

(async () => {
    app.listen(app.get('port'));
    console.log(`[Info] Server is listening on port ${app.get('port')}`);
})();
