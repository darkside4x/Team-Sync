import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgresql://neondb_owner:npg_Uuj4g9ayQbZH@ep-icy-forest-agr1pkab.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Best-effort lightweight migrations to keep columns in sync in hackathon mode
export async function ensureMinimalMigrations(): Promise<void> {
  // Add users.role if missing
  await pool.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';`);
  // Add events.domain if missing
  await pool.query(`ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS domain text;`);
}