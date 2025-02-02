import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/db/schema';

const dbUrl = process.env.POSTGRES_URL!;

const db = drizzle(dbUrl, {schema});
 
export default db;
 