// Create request observability middleware

import * as Sentry from "@sentry/bun";
import { Elysia } from "elysia";
import type {
  PreHandler, // For .onRequest()
  ErrorHandler, // For .onError()
  // AfterResponseHandler, // For .onAfterResponse()
} from "elysia";
import { logger } from "../lib/logger";

// Elysia doesn't provide middleware, it has lifecycle hooks

interface RequestMetadata {
  requestId: string;
  startedAt: number;
  method: string;
  path: string;
}

// Prefer WeakMap, automatically cleanup/delete when unused
const requestMetadata = new WeakMap<Request, RequestMetadata>();
const clientErrorCodes = new Set(["NOT_FOUND", "PARSE", "VALIDATION"]);

function metadataFor(request: Request): RequestMetadata {
  return (
    requestMetadata.get(request) ?? {
      requestId: crypto.randomUUID(),
      startedAt: performance.now(),
      method: request.method,
      path: new URL(request.url).pathname,
    }
  );
}

/**
 * A filter that determines whether error represents a server-side failure rather than an unexpected client mistake.
 */
function shouldCapture(code: string | number): boolean {
  if (typeof code === "number") {
    return code >= 500;
  }
  return !clientErrorCodes.has(code);
}

// set.staus — on normal successful response, it stays `undefined`
function statusCode(value: number | string | undefined): number {
  return typeof value === "number" ? value : 200;
}

function isHealthPath(path: string): boolean {
  return path === "/health/live" || path === "/health/ready";
}

// Prefer inline function this is just for fun (Let TS infer it)

/**
 *
 * @param set The mutable reaponse object in the context
 * @returns
 */
const onAfterResponseHandler: Parameters<Elysia["onAfterResponse"]>[1] = ({ request, set }) => {
  const metadata = metadataFor(request);

  if (isHealthPath(metadata.path)) {
    return;
  }

  logger.info(
    {
      requestId: metadata.requestId,
      method: metadata.method,
      path: metadata.path,
      statusCode: statusCode(set.status),
      durationMs: Math.round((performance.now() - metadata.startedAt) * 100) / 100,
    },
    "request completed",
  );
};

const onRequestHandler: PreHandler = ({ request, set }) => {
  const metadata = {
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
    startedAt: performance.now(),
    method: request.method,
    path: new URL(request.url).pathname,
  };

  requestMetadata.set(request, metadata);
  set.headers["x-request-id"] = metadata.requestId;
};

const onErrorHandler: ErrorHandler = ({ code, error, request }) => {
  const metadata = metadataFor(request);
  const errorCode = String(code);

  if (shouldCapture(code)) {
    logger.error(
      {
        err: error,
        requestId: metadata.requestId,
        method: metadata.method,
        path: metadata.path,
        errorCode,
      },
      "request failed",
    );

    // without `withScope` tag and context might be messy
    Sentry.withScope((scope) => {
      scope.setTag("request_id", metadata.requestId);
      scope.setTag("elysia_error_code", errorCode);
      scope.setContext("request", {
        method: metadata.method,
        path: metadata.path,
      });
      Sentry.captureException(error);
    });
  } else {
    // client-side errors
    logger.warn(
      {
        requestId: metadata.requestId,
        method: metadata.method,
        path: metadata.path,
        errorCode,
      },
      "request rejected",
    );
  }
};

export const observability = new Elysia({
  name: "observability",
})
  .onRequest(onRequestHandler)
  // { as: "global" } promote the hook to entire application
  //  Without scope, an error thrown in `likesRoutes` or `commentsRoutes` will not reach the `observability` plugin's `onError`
  .onError({ as: "global" }, onErrorHandler)
  .onAfterResponse({ as: "global" }, onAfterResponseHandler);
