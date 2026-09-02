import { describe, expect, it } from "bun:test";

import { createApp } from "../app";
import type { RateLimiter } from "../plugins/rate-limit";

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
const app = createApp({ rateLimiter: allowAllLimiter });

// Health check temporary
describe("GET /health", () => {
  it("returns the service status", async () => {
    const response = await app.handle(new Request("http://localhost/health"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
    });
  });
});

// Health check
describe("GET /health/live", () => {
  it("returns the process status and a request ID", async () => {
    const response = await app.handle(new Request("http://localhost/health/live"));
    expect(response.status).toBe(200);
    // check generated `requestId` UUID that `onRequest` hook intercepted
    expect(response.headers.get("x-request-id")).not.toBeNull();
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
