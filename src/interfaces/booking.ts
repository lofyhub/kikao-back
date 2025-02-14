import { z } from 'zod';
export interface Booking {
    id: string;
    userId: string;
    listingId: string;
    message: string;
    price: string;
    duration: string;
    checkInDate: string;
    createdAt: string;
    updatedAt: string;
}

export const bookingSchema = z.object({
    userId: z.string().uuid(),
    listingId: z.string().uuid(),
    message: z.string().nonempty(),
    price: z.string().nonempty(),
    duration: z.string().nonempty(),
    checkInDate: z.string().nonempty()
});
