import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { NotFoundError, UpdateFailedError } from '../errors';
import { payments, Payment, NewPayment } from '../db/schema';
import { PaymentCallbackData } from '../interfaces/payments';

class PaymentRepository {
    async createPayment(payment: NewPayment): Promise<Payment> {
        const [newPayment] = await db
            .insert(payments)
            .values(payment)
            .returning();
        return newPayment;
    }
    async getUserPayments(
        userId: string,
        limit: number = 10,
        offset: number = 0,
        status?: string
    ): Promise<Payment[]> {
        return await db
            .select()
            .from(payments)
            .where(
                status
                    ? and(
                          eq(payments.userId, userId),
                          eq(payments.status, status)
                      )
                    : eq(payments.userId, userId)
            )
            .limit(limit)
            .offset(offset);
    }

    async updatePaymentStatus(data: PaymentCallbackData): Promise<Payment> {
        const {
            merchantRequestId,
            checkoutRequestId,
            mpesaReceiptNumber,
            transactionDate,
            phoneNumber,
            amount,
            resultDescription,
            resultCode
        } = data;

        const [updatedPayment] = await db
            .update(payments)
            .set({
                merchantRequestId,
                checkoutRequestId,
                mpesaReceiptNumber,
                transactionDate,
                phoneNumber,
                amount,
                resultDescription,
                resultCode,
                updatedAt: new Date()
            })
            .where(eq(payments.checkoutRequestId, checkoutRequestId))
            .returning();

        if (!updatedPayment) {
            throw new UpdateFailedError(
                `Payment with Receipt Number ${mpesaReceiptNumber} was not updated!`
            );
        }
        return updatedPayment;
    }

    async findByTransactionId(transactionId: string): Promise<Payment> {
        const [payment] = await db
            .select()
            .from(payments)
            .where(eq(payments.transactionId, transactionId));

        if (!payment) {
            throw new NotFoundError(
                `Payment with transactionId ${transactionId} not found`
            );
        }

        return payment;
    }
}

export default new PaymentRepository();
