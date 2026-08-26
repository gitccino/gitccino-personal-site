import { describe, expect, it } from "bun:test";

import { jsonRequest, readCookie, request } from "./http";

describe("likes API", () => {
  it("likes, reads, and unlikes one subject", async () => {
    const initial = await request("/likes?subject=home");

    expect(initial.status).toBe(200);
    expect(await initial.json()).toEqual({
      count: 0,
      liked: false,
    });
    expect(initial.headers.get("set-cookie")).toBeNull();

    const liked = await jsonRequest("/likes", "POST", {
      subject: "home",
      website: "",
    });
    const cookie = readCookie(liked);

    expect(liked.status).toBe(200);
    expect(liked.headers.get("ratelimit-limit")).toBe("10000");
    expect(await liked.json()).toEqual({
      count: 1,
      liked: true,
    });

    const current = await request("/likes?subject=home", {
      headers: { cookie },
    });

    expect(await current.json()).toEqual({
      count: 1,
      liked: true,
    });

    const unliked = await jsonRequest("/likes", "POST", { subject: "home", website: "" }, cookie);

    expect(unliked.status).toBe(200);
    expect(await unliked.json()).toEqual({
      count: 0,
      liked: false,
    });
  });
});
