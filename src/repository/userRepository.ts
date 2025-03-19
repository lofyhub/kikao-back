import { eq, and } from 'drizzle-orm';
import { AuthStrategy, IUser } from '../interfaces/user';
import { db } from '../db';
import { users, User, NewUser } from '../db/schema';
import { BusinessInfo } from '../interfaces/auth';
import { sendEmail } from '../config/mailer';
import { NotFoundError, UpdateFailedError, GenericError } from '../errors';
import { filterUserData } from '../utils/helpers';

class UserRepository {
    async createUser(new_user: NewUser): Promise<IUser> {
        const user_data = await db.transaction(async (tx) => {
            const new_data = await tx
                .insert(users)
                .values(new_user)
                .returning();
            return new_data;
        });

        if (!user_data || user_data.length === 0) {
            throw new GenericError('Error saving user!');
        }
        const user_name = user_data[0].username;

        // TODO: Refactor to use queues or background jobs
        sendEmail(user_name).catch((err) => {
            console.error('Error sending email for user:', user_name, err);
        });

        return filterUserData(user_data[0]);
    }
    async getUserById(id: string): Promise<IUser> {
        const result = await db.select().from(users).where(eq(users.id, id));

        if (!result || result.length === 0) {
            throw new GenericError('Error fetching user by Id');
        }
        return filterUserData(result[0]);
    }
    async updateBusiness(
        user_id: string,
        user_data: BusinessInfo
    ): Promise<IUser> {
        const updated_user = await db
            .update(users)
            .set(user_data)
            .where(eq(users.id, user_id))
            .returning();

        if (!updated_user || updated_user.length === 0) {
            throw new UpdateFailedError(
                'Error registering business, please try again or contact support!'
            );
        }

        return filterUserData(updated_user[0]);
    }
    async getUserByStrategyAndAccountId(
        strategy: AuthStrategy,
        account_id: string
    ): Promise<IUser | undefined | null> {
        const result = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.provider, strategy),
                    eq(users.providerUserId, account_id)
                )
            );

        return result[0];
    }
}

export default new UserRepository();
