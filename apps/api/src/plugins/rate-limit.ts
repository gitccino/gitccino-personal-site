import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { Server } from "bun";
import { Elysia } from "elysia";

const WRITE_PATHS = new Set(["/likes", "/comments"]);
const DEFAULT_MAX_REQUESTS = 10;
const DEFAULT_WINDOW = "60 s";

// Structural type so tests can inject an in-memory fake without a live Upstash.
// The real Ratelimit.limit() returns extra fields; those are assignable here.
export interface RateLimiter {
  limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix ms when the window resets
  }>;
}

type ClientKeyGenerator = (
  request: Request,
  server: Server<unknown> | null,
) => string;

interface WriteRateLimiterOptions {
  limiter?: RateLimiter;
  generator?: ClientKeyGenerator;
}

function defaultLimiter(): Ratelimit {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(DEFAULT_MAX_REQUESTS, DEFAULT_WINDOW),
    prefix: "rl:write",
    // In-process short-circuit: an already-blocked key is rejected without a
    // round trip to Upstash. Safe on a long-running server.
    ephemeralCache: new Map(),
    analytics: false,
  });
}

const clientIpGenerator: ClientKeyGenerator = (request, server) => {
  if (Bun.env.TRUST_PROXY === "true") {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const forwardedClientIp = forwardedFor?.split(",").at(-1)?.trim();

    if (forwardedClientIp) {
      return forwardedClientIp;
    }
  }

  return server?.requestIP(request)?.address ?? "unknown";
};

export function createWriteRateLimiter(options: WriteRateLimiterOptions = {}) {
  const limiter = options.limiter ?? defaultLimiter();
  const generator = options.generator ?? clientIpGenerator;

  return new Elysia({ name: "write-rate-limiter" }).onBeforeHandle(
    { as: "global" },
    async ({ request, server, set }) => {
      const pathname = new URL(request.url).pathname;

      // Only count the two write endpoints; everything else passes untouched.
      if (request.method !== "POST" || !WRITE_PATHS.has(pathname)) {
        return;
      }

      const key = generator(request, server);
      const { success, limit, remaining, reset } = await limiter.limit(key);

      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((reset - Date.now()) / 1000),
      );

      set.headers["RateLimit-Limit"] = String(limit);
      set.headers["RateLimit-Remaining"] = String(remaining);
      set.headers["RateLimit-Reset"] = String(retryAfterSeconds);

      if (!success) {
        set.status = 429;
        set.headers["Retry-After"] = String(retryAfterSeconds);
        return { error: "Too many requests" };
      }
    },
  );
}
