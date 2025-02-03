import { eq, and } from 'drizzle-orm';
import { AuthStrategy } from '../interfaces/user';
import { db } from '../db';
import { users, User, NewUser } from '../db/schema';
import { BusinessInfo } from '../controllers/auth_controller';
import { sendEmail } from '../config/mailer';
import {
    NotFoundError,
    UpdateFailedError,
    GenericError
} from '../errors';

class UserRepository {
    async createUser(new_user: NewUser): Promise<User> {
        try {
            const user_data = await db.transaction(async (tx) => {
                const new_data = await tx.insert(users).values(new_user).returning();
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

            return user_data[0];
        } catch (error:unknown) {
            throw new GenericError('Error saving user!');
        }
    }
    async getUserById(id: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result.length === 0 ? null : result[0];
    }
    async updateUser(user_id: string, user_data: BusinessInfo): Promise<User> {
        try {
            const updated_user = await db
                .update(users)
                .set(user_data)
                .where(eq(users.id, user_id))
                .returning();

            if (updated_user.length === 0) {
                throw new NotFoundError(`User with ID ${user_id} not found!`);
            }

            return updated_user[0];
        } catch (error: unknown) {
            throw new UpdateFailedError(`Error updating user with ID ${user_id}`);
        }
    }
    async getUserByStrategyAndAccountId(
        strategy: AuthStrategy,
        account_id: string
    ): Promise<User | null> {
        try {
            const result = await db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.provider, strategy),
                        eq(users.providerUserId, account_id)
                    )
                );
            return result.length === 0 ? null : result[0];
        } catch (error: unknown) {
            console.error('Error getting user by strategy and account id', error);
            return null;
        }
    }
}

export default new UserRepository();
