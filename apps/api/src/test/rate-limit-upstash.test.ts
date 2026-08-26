import { describe, expect, it } from "bun:test";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  Boolean(Bun.env.UPSTASH_REDIS_REST_URL) && Boolean(Bun.env.UPSTASH_REDIS_REST_TOKEN);
const maybe = hasUpstash ? describe : describe.skip;

maybe("Upstash sliding window", () => {
  it("blocks after the max within the window", async () => {
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(2, "60 s"),
      prefix: "rl:test",
    });

    // Unique key so repeated runs never collide.
    const key = `test-${process.pid}-${Bun.nanoseconds()}`;

    expect((await ratelimit.limit(key)).success).toBe(true);
    expect((await ratelimit.limit(key)).success).toBe(true);
    expect((await ratelimit.limit(key)).success).toBe(false);
  });
});
