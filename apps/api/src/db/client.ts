import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const queryClient = postgres(databaseUrl);

export const readinessClient = postgres(databaseUrl, {
  max: 1,
  connect_timeout: 1,
  prepare: false, // Disables PostgreSQL prepared statement caching for this client
});

export const db = drizzle({
  client: queryClient,
});
