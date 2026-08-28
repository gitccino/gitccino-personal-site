import Elysia, { t } from "elysia";
import { db } from "../db/client";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const liveResponseSchema = t.Object({
  status: t.Literal("ok"),
});

const unavailableResponseSchema = t.Object({
  status: t.Literal("unavailable"),
});

export const healthRoutes = new Elysia({ name: "health-routes" })
  .get("/health/live", () => ({ status: "ok" }) as const, { response: liveResponseSchema })
  .get(
    "/health/ready",
    async ({ status }) => {
      try {
        await db.execute(sql`select 1`);

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
