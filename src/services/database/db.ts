import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../../lib/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                        // max connections - reduce to avoid overload
  min: 1,                         // at least connection alive
  idleTimeoutMillis: 60000,        // Keep connections alive
  connectionTimeoutMillis: 10000,  // connection timeout
});
export const db = drizzle(pool, { schema });