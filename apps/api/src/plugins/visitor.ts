import { Elysia, type Cookie } from "elysia";
import { z } from "zod";

export const uuidV4Schema = z.uuid({
  version: "v4",
  error: "Invalid UUID format",
});
const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function parseVisitorId(value: unknown): string | null {
  const result = uuidV4Schema.safeParse(value);
  return result.success ? result.data : null;
}

// per-request helper that injects new values into your handler's context
export const visitorContext = new Elysia({ name: "visitor-context" }).derive(
  {
    as: "scoped",
  },
  ({ cookie: { visitor_id } }) => ({
    visitorId: parseVisitorId(visitor_id?.value),
  }),
);

// call from POST handlers: reuse existing id, or mint one and set the cookie
export function requireVisitorId(
  visitorId: string | null,
  visitorCookie: Cookie<unknown>,
  // visitorCookie: Cookie<unknown> | undefined,
): string {
  // if (!visitorCookie) throw new Error("visitor cookie unavailable");
  if (visitorId) return visitorId;

  const newVisitorId = crypto.randomUUID();

  visitorCookie.set({
    value: newVisitorId,
    httpOnly: true,
    secure: Bun.env.NODE_ENV === "production",
    sameSite: "lax", // blocks the CSRF attack
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS,
  });

  return newVisitorId;
}
