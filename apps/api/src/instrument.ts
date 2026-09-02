import * as Sentry from "@sentry/bun";

const dsn = Bun.env.SENTRY_DSN?.trim();

// const healthPaths = new Set(["/health", "/health/live", "/health/ready"]);
const rawTraceSampleRate = Bun.env.SENTRY_TRACES_SAMPLE_RATE?.trim() || "0.1";
const traceSampleRate = Number(rawTraceSampleRate);

if (!Number.isFinite(traceSampleRate) || traceSampleRate < 0 || traceSampleRate > 1) {
  throw new Error("SENTRY_TRACES_SAMPLE_RATE must be between 0 and 1");
}

// Sentry must initialize before Elysia, Postgres, and other modules load
// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment: Bun.env.SENTRY_ENVIRONMENT ?? Bun.env.NODE_ENV ?? "development",
  release: Bun.env.SENTRY_RELEASE || undefined,
  sendDefaultPii: false,

  // // Add Performance Monitoring by setting tracesSampleRate
  tracesSampleRate: 1.0,

  // // Just in case enabling tracesSampleRate
  // tracesSampler({ attributes, inheritOrSampleWith }) {
  //   const path = attributes?.["url.path"];
  //   if (typeof path === "string" && healthPaths.has(path)) {
  //     return 0;
  //   }
  //   return inheritOrSampleWith(traceSampleRate);
  // },
});
