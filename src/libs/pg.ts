import { drizzle } from 'drizzle-orm/node-postgres';

const dbUrl = process.env.POSTGRES_URL!;

const db = drizzle(dbUrl);
 
export default db;
