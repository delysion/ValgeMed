import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { schema } from "@/lib/db/schema";

export type AppDb = NeonHttpDatabase<typeof schema>;

let cachedDb: AppDb | null = null;

export function getDb(): AppDb {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL mancante. Configura Neon Postgres prima di usare il database.");
  }

  if (!cachedDb) {
    cachedDb = drizzle(neon(databaseUrl), { schema });
  }

  return cachedDb;
}

export async function withDb<T>(
  operation: (db: AppDb) => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation(getDb());
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

export function getDatabaseStatus() {
  return {
    configured: Boolean(process.env.DATABASE_URL),
    provider: "Neon Postgres",
  };
}
