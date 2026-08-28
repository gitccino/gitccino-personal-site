import * as Sentry from "@sentry/bun";

const dsn = Bun.env.SENTRY_DSN?.trim();

// Sentry must initialize before Elysia, Postgres, and other modules load
// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment: Bun.env.SENTRY_ENVIRONMENT ?? Bun.env.NODE_ENV ?? "development",
  release: Bun.env.SENTRY_RELEASE || undefined,
  // Add Performance Monitoring by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
