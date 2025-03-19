import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { generateJWTToken } from '../utils/helpers';
import { cloudinaryInstance } from '../utils/cloudinary';
import userRepository from '../repository/userRepository';
import passport from '../config/passport';
import {
    createErrorResponse,
    createSuccessResponse
} from '../utils/responseUtils';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { User } from '../db/schema';
import env from '../env';
import { JWTUserPayload } from '../interfaces';
import { registerBusinessSchema, BusinessInfo } from '../interfaces/auth';
import { ErrorCodes, ValidationError, validationMessage } from '../errors';

const router = Router();

const multerStorage = multer.memoryStorage();

const upload = multer({
    limits: { fileSize: env.IMAGE_UPLOAD_SIZE_LIMIT },
    storage: multerStorage
}).single('business_logo');

async function registerBusiness(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { businessName, location, phoneNumber, businessType, businessCity } =
        req.body;

    const user_id: string = (req.user as JWTUserPayload).id;

    const regBusinessValidation = registerBusinessSchema.safeParse(req.body);

    if (!regBusinessValidation.success) {
        const error_formatted = regBusinessValidation.error.format();
        return next(new ValidationError(validationMessage, error_formatted));
    }

    try {
        let business_image = '';

        if (req.file) {
            const { imageURL } = await cloudinaryInstance.uploadImage(
                req.file.path
            );
            if (imageURL) {
                business_image = imageURL;
            }
        }

        const businessInfo: BusinessInfo = {
            phoneNumber,
            businessName,
            businessLocation: location,
            businessType,
            businessCity,
            businessLogo: business_image
        };

        const result = await userRepository.updateBusiness(
            user_id,
            businessInfo
        );

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Business registered successfully!',
                    result
                )
            );
    } catch (error: unknown) {
        return next(error);
    }
}

// Routes
router.get('/oauth/google', passport.authenticate('google'));

router.get(
    '/oauth/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${env.FRONTEND_APP_LOGIN_FAILURE_REDIRECT}`
    }),
    (req: Request, res: Response) => {
        const user: User = req.user as User;

        if (user) {
            const token = generateJWTToken(user);

            const redirectUrl = `${env.FRONTEND_APP_LOGIN_SUCCESS_REDIRECT}?user_name=${user.username}&token=${token}&email=${user.email}&image=${user.profileImage}&id=${user.id}`;

            return res.redirect(redirectUrl);
        }
        return res.redirect(`${env.FRONTEND_APP_LOGIN_FAILURE_REDIRECT}`);
    }
);

router.post(
    '/logout',
    function (req: Request, res: Response, next: NextFunction): void {
        req.logout(function (err: any) {
            if (err) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(
                            'An error occurred while logging out.',
                            ErrorCodes.APIError,
                            err.message
                        )
                    );
            }
            return res
                .status(200)
                .json(createSuccessResponse('Logout was successful.'));
        });
    }
);

router.post('/register/business', verifyJWTToken, upload, registerBusiness);

export default router;
