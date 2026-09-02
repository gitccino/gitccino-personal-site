import pino from "pino";

export const logger = pino({
  level: Bun.env.LOG_LEVEL ?? "info",
  // deafult metadata that attach to every JSON log line
  base: {
    service: "gitccino-api",
    environment: Bun.env.SENTRY_ENVIRONMENT ?? Bun.env.NODE_ENV ?? "development",
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
  // security and data privacy feature, auto masks sensitive info
  redact: {
    paths: [
      "cookie",
      "headers.cookie",
      "headers.authorization",
      "request.headers.cookie",
      "request.headers.authorization",
    ],
    censor: "[REDACTED]",
  },
});
