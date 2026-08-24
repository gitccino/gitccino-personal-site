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

describe("GET /health", () => {
  it("returns the service status", async () => {
    const response = await app.handle(new Request("http://localhost/health"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
    });
  });
});
