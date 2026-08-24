import { sql } from "drizzle-orm";
import { db, queryClient } from "./client";

try {
  const rows = await db.execute(
    sql`select current_database() as database, current_user as username`,
  );

  console.log(rows[0]);
} finally {
  await queryClient.end();
}
