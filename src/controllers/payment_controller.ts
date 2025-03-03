import { NextFunction, Request, Response, Router } from 'express';
import paymentRespository from '../repository/paymentRespository';
import { createSuccessResponse } from '../utils/responseUtils';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { JWTUserPayload } from '../interfaces';
import { GenericError, ValidationError, validationMessage } from '../errors';
import { transactionIdQuery } from '../interfaces/payments';
import { db } from '../db';

const router = Router();

async function fetchUserPayments(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
    } catch (error) {}
}

async function processUserPayment(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
    } catch (error) {}
}

async function findTransactionById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    try {
        const { transactionId } = req.params;

        const queryValidation = transactionIdQuery.safeParse(transactionId);

        if (!queryValidation.success) {
            const error_formatted = queryValidation.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        }
        const transaction = await paymentRespository.findByTransactionId(
            transactionId
        );

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Successfully fetched transaction!',
                    transaction
                )
            );
    } catch (error) {
        return next(error);
    }
}

async function updatePaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
    } catch (error) {}
}

// Routes
router.put('/user/payments', verifyJWTToken, updatePaymentStatus);
router.get('/user/payments', verifyJWTToken, fetchUserPayments);
router.get(
    '/user/payments/:transactionId',
    verifyJWTToken,
    findTransactionById
);
router.post('/user/payments', verifyJWTToken, processUserPayment);

export default router;
