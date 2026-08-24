import { t } from "elysia";

export const subjectSchema = t.String({
  minLength: 1,
  maxLength: 200,
  pattern: "^(home|article:[a-z0-9]+(?:-[a-z0-9]+)*)$",
});
/**
 home
 article:aschild
 article:compound-components
 article:headless-hook-prop-getters
 */

export const honeypotSchema = t.Optional(t.String({ maxLength: 200 }));

export const errorResponseSchema = t.Object({
  error: t.String(),
});
