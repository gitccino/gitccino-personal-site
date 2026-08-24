import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";

import {
  requireVisitorId,
  uuidV4Schema,
  visitorContext,
} from "../plugins/visitor";

const visitorTestApp = new Elysia()
  .use(visitorContext)
  .get("/visitor", ({ visitorId }) => ({ visitorId }))
  .post("/visitor", ({ visitorId, cookie: { visitor_id } }) => ({
    visitorId: requireVisitorId(visitorId, visitor_id!),
  }));

describe("visitor identity", () => {
  it("does not mint a cookie for GET", async () => {
    const response = await visitorTestApp.handle(
      new Request("http://localhost/visitor"),
    );

    expect(await response.json()).toEqual({ visitorId: null });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("reads a valid visitor cookie", async () => {
    const visitorId = crypto.randomUUID();
    const response = await visitorTestApp.handle(
      new Request("http://localhost/visitor", {
        headers: { cookie: `visitor_id=${visitorId}` },
      }),
    );

    expect(await response.json()).toEqual({ visitorId });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("treats an invalid cookie as missing", async () => {
    const response = await visitorTestApp.handle(
      new Request("http://localhost/visitor", {
        headers: { cookie: "visitor_id=not-a-uuid" },
      }),
    );

    expect(await response.json()).toEqual({ visitorId: null });
  });

  it("mints a cookie for a write request", async () => {
    const response = await visitorTestApp.handle(
      new Request("http://localhost/visitor", { method: "POST" }),
    );
    const body = (await response.json()) as { visitorId: string };
    const setCookie = response.headers.get("set-cookie");

    expect(uuidV4Schema.safeParse(body.visitorId).success).toBe(true);
    expect(setCookie).toContain(`visitor_id=${body.visitorId}`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Path=/");
  });
});
