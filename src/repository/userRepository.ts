import { eq, and, or } from 'drizzle-orm';
import { AuthStrategy } from '../interfaces/user';
import { db } from '../db';
import { users, User, NewUser } from '../db/schema';
import { BusinessInfo } from '../controllers/auth_controller';

class UserRepository {
    async createUser(userData: NewUser): Promise<User> {
        try {
            const user_data = await db
                .insert(users)
                .values(userData)
                .returning();
            return user_data[0];
        } catch (error) {
            throw new Error('Error creating user');
        }
    }
    async getUserById(id: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result.length === 0 ? null : result[0];
    }
    async updateUser(user_id: string, userData: BusinessInfo): Promise<User> {
        try {
            const user_to_update = await this.getUserById(user_id);

            if (!user_to_update) {
                throw new Error('User not found');
            }

            const updated_user = await db
                .update(users)
                .set(userData)
                .where(eq(users.id, user_id))
                .returning();

            return updated_user[0];
        } catch (error) {
            throw new Error('Error updating user');
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
        } catch (error) {
            console.log('Error getting user by strategy and account id', error);
            return null;
        }
    }
}

export default new UserRepository();
