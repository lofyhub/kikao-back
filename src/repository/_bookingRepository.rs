import { db } from '../db';
import { Bookings, NewBooking, Booking } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
    DeleteFailedError,
    GenericError,
    NotFoundError,
    UnauthorizedError
} from '../errors';

class BookingRepository {
    async saveBooking(booking: NewBooking): Promise<Booking> {
        const result = await db.insert(Bookings).values(booking).returning();

        if (!result || result.length === 0) {
            throw new GenericError(
                'Error occured while saving Booking, Try again!'
            );
        }

        return result[0];
    }
    async findBookingById(booking_id: string): Promise<Booking> {
        const result = await db
            .select()
            .from(Bookings)
            .where(eq(Bookings.id, booking_id));

        if (!result || result.length === 0) {
            throw new NotFoundError(
                `Booking with ID ${booking_id} was not found!`
            );
        }

        return result[0];
    }
    async findUserBookingsById(user_id: string): Promise<Booking[]> {
        const result = await db
            .select()
            .from(Bookings)
            .where(eq(Bookings.id, user_id));

        if (!result || result.length === 0) {
            throw new NotFoundError(`No Bookings found for this user!`);
        }

        return result;
    }
    async deleteBooking(booking_id: string, user_id: string): Promise<Booking> {
        const booking_to_delete = await this.findBookingById(booking_id);

        if (booking_to_delete.userId !== user_id) {
            throw new UnauthorizedError(`You can only delete your Booking!`);
        }

        const is_deleted = await db
            .delete(Bookings)
            .where(eq(Bookings.id, booking_id));

        if (!is_deleted) {
            throw new DeleteFailedError(`Booking deletion was not successful.`);
        }

        return booking_to_delete;
    }
}

export default new BookingRepository();
