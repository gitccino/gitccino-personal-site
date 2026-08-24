import { describe, expect, it } from "bun:test";

import { db } from "./setup";
import { comments, likes } from "../../db/schema";
import { jsonRequest, request } from "./http";

describe("API guardrails", () => {
  it("rejects honeypot and blank comment submissions", async () => {
    const botLike = await jsonRequest("/likes", "POST", {
      subject: "home",
      website: "https://spam.example",
    });
    const blankComment = await jsonRequest("/comments", "POST", {
      subject: "home",
      body: "   ",
      website: "",
    });

    expect(botLike.status).toBe(400);
    expect(blankComment.status).toBe(400);
    expect(await db.select().from(likes)).toEqual([]);
    expect(await db.select().from(comments)).toEqual([]);
  });

  it("rejects an invalid subject", async () => {
    const response = await request("/comments?subject=not-a-subject");

    expect(response.status).toBe(422);
  });

  it("allows the configured frontend origin", async () => {
    const response = await request("/likes?subject=home", {
      headers: { origin: "http://localhost:5173" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:5173",
    );
    expect(response.headers.get("access-control-allow-credentials")).toBe(
      "true",
    );
  });
});
