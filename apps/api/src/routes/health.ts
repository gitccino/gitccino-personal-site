import Elysia, { t } from "elysia";
import { readinessClient } from "../db/client";
// import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const liveResponseSchema = t.Object({
  status: t.Literal("ok"),
});

const unavailableResponseSchema = t.Object({
  status: t.Literal("unavailable"),
});

const READINESS_TIMEOUT_MS = 2_000;
async function assertDatabaseReady() {
  const query = readinessClient`select 1`.execute();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      try {
        query.cancel();
      } finally {
        reject(new Error(`Database readiness check exceeded ${READINESS_TIMEOUT_MS}ms`));
      }
    }, READINESS_TIMEOUT_MS);
  });

  try {
    await Promise.race([query, deadline]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

export const healthRoutes = new Elysia({ name: "health-routes" })
  .get("/health/live", () => ({ status: "ok" }) as const, { response: liveResponseSchema })
  .get(
    "/health/ready",
    async ({ status }) => {
      try {
        // await db.execute(sql`select 1`);
        await assertDatabaseReady();

        return { status: "ok" } as const;
      } catch (err) {
        logger.warn({ err }, "database readiness check failed");

        return status(503, {
          status: "unavailable",
        } as const);
      }
    },
    {
      response: {
        200: liveResponseSchema,
        503: unavailableResponseSchema,
      },
    },
  );
