import { JWTUserPayload } from '../interfaces';

declare global {
    namespace Express {
        interface Request {
            user?: JWTUserPayload;
        }
    }
}
