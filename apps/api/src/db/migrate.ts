import { resolve } from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db, queryClient } from "./client";

try {
  await migrate(db, {
    migrationsFolder: resolve(import.meta.dir, "../../drizzle"),
  });

  console.log("Database migrations completed");
} finally {
  await queryClient.end({ timeout: 5 });
}
