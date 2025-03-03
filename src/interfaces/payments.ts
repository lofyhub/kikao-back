import { z } from 'zod';

export const paymentSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    phoneNumber: z
        .string()
        .regex(/^\+254\d{9}$/, 'Phone number must be in format +254XXXXXXXXX')
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
