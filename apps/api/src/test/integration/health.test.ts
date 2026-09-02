import { describe, expect, it } from "bun:test";
import { request } from "./http";

describe("health API", () => {
  it("reports database readiness", async () => {
    const response = await request("/health/ready");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
