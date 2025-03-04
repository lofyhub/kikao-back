import { NextFunction, Request, Response, Router } from 'express';
import paymentRespository from '../repository/paymentRespository';
import { createSuccessResponse } from '../utils/responseUtils';
import { verifyJWTToken } from '../middlewares/verifyToken';
import { ValidationError, validationMessage } from '../errors';
import {
    CallbackResponse,
    PaymentCallbackData,
    paymentSchema,
    transactionIdQuery
} from '../interfaces/payments';
import env from '../env';
import Mpesa from 'mpesa-node';

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
): Promise<any> {
    try {
        const { phoneNumber, amount } = req.body;

        const isValid = paymentSchema.safeParse(req.body);

        if (!isValid.success) {
            const error_formatted = isValid.error.format();
            return next(
                new ValidationError(validationMessage, error_formatted)
            );
        }

        const mpesaApi = new Mpesa({
            consumerKey: env.SAFARICOM_CONSUMER_KEY,
            consumerSecret: env.SAFARICOM_CONSUMER_SECRET
        });

        const accountRef = Math.random().toString(35).substr(2, 7);

        const res_mpesa = await mpesaApi.lipaNaMpesaOnline(
            phoneNumber,
            amount,
            URL + '/lipanampesa/success',
            accountRef
        );

        const savedPayment = paymentRespository.createPayment(res_mpesa);

        return res
            .status(200)
            .json(
                createSuccessResponse(
                    'Successfully made the paymen!',
                    savedPayment
                )
            );
    } catch (error) {
        return next(error);
    }
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
): Promise<any> {
    try {
        const data: CallbackResponse = req.body;

        let mpesaReceiptNumber = '';
        let transactionDate = '';
        let phoneNumber = '';
        let amount = '';

        for (const item of data.Body.stkCallback.CallbackMetadata.Item) {
            switch (item.Name) {
                case 'MpesaReceiptNumber':
                    mpesaReceiptNumber = String(item.Value);
                    break;
                case 'TransactionDate':
                    transactionDate = String(item.Value);
                    break;
                case 'PhoneNumber':
                    phoneNumber = String(item.Value);
                    break;
                case 'Amount':
                    amount = String(item.Value);
                    break;
            }
        }

        const callbackDataUpdate: PaymentCallbackData = {
            merchantRequestId: data.Body.stkCallback.MerchantRequestID,
            checkoutRequestId: data.Body.stkCallback.CheckoutRequestID,
            mpesaReceiptNumber,
            transactionDate,
            phoneNumber,
            amount,
            resultDescription: data.Body.stkCallback.ResultDesc,
            resultCode: String(data.Body.stkCallback.ResultCode)
        };

        const updatedPayment = await paymentRespository.updatePaymentStatus(
            callbackDataUpdate
        );
        return res
            .status(200)
            .json(createSuccessResponse('Callback processed', updatedPayment));
    } catch (error) {}
}

// Routes
router.get('/user/payments', verifyJWTToken, fetchUserPayments);
router.get(
    '/user/payments/:transactionId',
    verifyJWTToken,
    findTransactionById
);
router.post('/user/payments', verifyJWTToken, processUserPayment);
router.post('/lipanampesa/success', verifyJWTToken, updatePaymentStatus);

export default router;
