import { afterAll, beforeAll, beforeEach } from "bun:test";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import type { RateLimiter } from "../../plugins/rate-limit";

const testDatabaseUrl = Bun.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required");
}

const testDatabaseName = new URL(testDatabaseUrl).pathname.slice(1);

if (testDatabaseName !== "gitccino_test") {
  throw new Error(`Refusing to run integration tests against ${testDatabaseName}`);
}

Bun.env.DATABASE_URL = testDatabaseUrl;

const allowAllLimiter: RateLimiter = {
  async limit() {
    return {
      success: true,
      limit: 10_000,
      remaining: 9_999,
      reset: Date.now() + 60_000,
    };
  },
};

const [{ createApp }, { db, queryClient, readinessClient }, { comments, likes }] =
  await Promise.all([import("../../app"), import("../../db/client"), import("../../db/schema")]);

const app = createApp({ rateLimiter: allowAllLimiter });

beforeAll(async () => {
  await migrate(db, {
    migrationsFolder: resolve(import.meta.dir, "../../../drizzle"),
  });
});

beforeEach(async () => {
  await db.delete(comments);
  await db.delete(likes);
});

afterAll(async () => {
  // await queryClient.end({ timeout: 5 });
  // await readinessClient.end({ timeout: 5 });

  const results = await Promise.allSettled([
    queryClient.end({ timeout: 5 }),
    readinessClient.end({ timeout: 5 }),
  ]);

  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);

  if (failures.length > 0) {
    throw new AggregateError(failures, "Database teardown failed");
  }
});

export { app, db };
