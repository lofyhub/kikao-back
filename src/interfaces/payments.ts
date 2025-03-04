import { z } from 'zod';

export const paymentSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    phoneNumber: z
        .string()
        .regex(/^\+254\d{9}$/, 'Phone number must be in format +254XXXXXXXXX')
        .nonempty()
});

export const paymentQuerySchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    offset: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 0)),
    status: z.enum(['pending', 'completed', 'failed']).optional()
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;

export const transactionIdQuery = z.string().nonempty();

export interface PaymentResponse {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
}

export interface PaymentUpdateData {
    status: string;
    responseCode?: string;
    responseDescription?: string;
    customerMessage?: string;
    mpesaReceiptNumber?: string | null;
    transactionDate?: Date | null;
    phoneNumber?: string;
    amount?: number;
}

export interface PaymentCallbackData {
    merchantRequestId: string;
    checkoutRequestId: string;
    mpesaReceiptNumber: string;
    transactionDate: string;
    phoneNumber: string;
    amount: string;
    resultDescription: string;
    resultCode: string;
}

export interface CallbackResponse {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;
            ResultDesc: string;
            CallbackMetadata: {
                Item: Array<{
                    Name: string;
                    Value: number | string;
                }>;
            };
        };
    };
}
