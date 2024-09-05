import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'
// Hardcoded database URL
const databaseUrl = "postgresql://neondb_owner:KMfhE05wLiOR@ep-young-silence-a5rq4yve-pooler.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require";
// Initialize the database connection
const sql = neon(databaseUrl);
// Create and export the database instance
export const db = drizzle(sql, {schema});
