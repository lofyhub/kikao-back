import app from './app';

(async () => {
    app.listen(app.get('port'));
    console.log(`[Info] Server is listening on port ${app.get('port')}`);
})();
