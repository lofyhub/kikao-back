import env from '../env';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const dbUrl = env.DATABASE_URL;

const queryClient = postgres(dbUrl);

export const db = drizzle(queryClient, { schema });
