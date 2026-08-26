import { describe, expect, it } from "bun:test";
import Elysia from "elysia";
import { createWriteRateLimiter, type RateLimiter } from "../plugins/rate-limit";

// Deterministic in-memory sliding-ish window good enough for the hook tests
function fakeLimiter(max: number): RateLimiter {
  const hits = new Map<string, number>();
  const windowMs = 60_000;
  return {
    async limit(identifier) {
      const count = (hits.get(identifier) ?? 0) + 1;
      hits.set(identifier, count);
      return {
        success: count <= max,
        limit: max,
        remaining: Math.max(0, max - count),
        reset: Date.now() + windowMs,
      };
    },
  };
}

function createTestApp() {
  return new Elysia()
    .use(
      createWriteRateLimiter({
        limiter: fakeLimiter(2),
        generator: (request) => request.headers.get("x-test-client") ?? "anonymous",
      }),
    )
    .get("/likes", () => ({ ok: true }))
    .post("/likes", () => ({ ok: true }))
    .post("/comments", () => ({ ok: true }))
    .delete("/comments/:id", () => ({ ok: true }))
    .get("/health", () => ({ ok: true }));
}

function send(
  app: ReturnType<typeof createTestApp>,
  path: string,
  method: "GET" | "POST" | "DELETE",
  client = "client-a",
) {
  return app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: { "x-test-client": client },
    }),
  );
}

describe("write rate limiter", () => {
  it("shares one limit across likes and comments", async () => {
    const app = createTestApp();

    const first = await send(app, "/likes", "POST");
    const second = await send(app, "/comments", "POST");
    const blocked = await send(app, "/likes", "POST");

    expect(first.status).toBe(200);
    expect(first.headers.get("ratelimit-remaining")).toBe("1");
    expect(second.status).toBe(200);
    expect(second.headers.get("ratelimit-remaining")).toBe("0");
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).not.toBeNull();
    expect(await blocked.json()).toEqual({ error: "Too many requests" });
  });

  it("keeps separate counters for separate clients", async () => {
    const app = createTestApp();

    await send(app, "/likes", "POST", "client-a");
    await send(app, "/likes", "POST", "client-a");

    const blockedClient = await send(app, "/likes", "POST", "client-a");
    const otherClient = await send(app, "/likes", "POST", "client-b");

    expect(blockedClient.status).toBe(429);
    expect(otherClient.status).toBe(200);
  });

  it("does not count read, delete, or health requests", async () => {
    const app = createTestApp();

    for (let index = 0; index < 3; index += 1) {
      expect((await send(app, "/likes", "GET")).status).toBe(200);
      expect((await send(app, "/comments/example-id", "DELETE")).status).toBe(200);
      expect((await send(app, "/health", "GET")).status).toBe(200);
    }

    expect((await send(app, "/likes", "POST")).status).toBe(200);
    expect((await send(app, "/comments", "POST")).status).toBe(200);
  });
});
