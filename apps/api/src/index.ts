import * as Sentry from "@sentry/bun";

import { createApp } from "./app";
import { queryClient } from "./db/client";
import { logger } from "./lib/logger";

// api require Upstash
if (!Bun.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("UPSTASH_REDIS_REST_URL is required");
}
if (!Bun.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_TOKEN is required");
}

const app = createApp();
const port = Number(Bun.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must contain a valid port number");
}

app.listen(port);

logger.info(
  {
    port,
    url: app.server?.url.toString(),
  },
  "API listening",
);

// Graceful shutdown when the Docker or AWS ECS stops the container with SIGTERM or Ctrl+C
let shuttingDown = false;

async function shutdown(signal: "SIGINT" | "SIGTERM") {
  if (shuttingDown) return;

  shuttingDown = true;
  logger.info({ signal }, "shutdown started");
  await app.stop();

  // Promise.allSettled guarantees both operations complete
  // Promise.all, en error closing db would immediately reject and abort before Sentry finish flushing
  const [databaseResult, sentryResult] = await Promise.allSettled([
    queryClient.end({ timeout: 5 }),
    Sentry.close(2_000),
  ]);

  if (databaseResult.status === "rejected") {
    logger.error({ err: databaseResult.reason }, "database shutdown failed");
  }

  if (sentryResult.status === "rejected") {
    logger.error({ err: sentryResult.reason }, "Sentry flush failed");
  }

  logger.info({ signal }, "shutdown completed");
  process.exit(0);
}

// When the OS emits the SIGTERM event to this process, run this callback function.

// SIGINT — triggered when press Ctrl+C
process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

// SIGTERM — The standard termination signal sent by Docker, AWS ECS
process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
