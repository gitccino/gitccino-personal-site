import { treaty } from "@elysiajs/eden";
import type { App } from "@gitccino/api/app";
import { API_URL } from "./config";

export const api = treaty<App>(API_URL, {
  fetch: { credentials: "include" },
});

export function requestIdHeader() {
  return { "X-Request-ID": crypto.randomUUID() };
}

/**
 * Eden treaty hands you a parsed object instead. It never throws on a 4xx/5xx.
 * Return the same shape whether the call worked or failed.
 */
export class ApiError extends Error {
  status: number;
  response: Response | undefined;

  constructor(status: number, message: string, response: Response | undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }

  /** Seconds to wait before retry; only present on 429. */
  get retryAfterSeconds() {
    return Number(this.response?.headers.get("Retry-After")) || null;
  }

  get requestId() {
    return this.response?.headers.get("X-Request-ID") ?? null;
  }
}

export async function unwrap<T>(
  promise: Promise<{
    data: T | null;
    error: { value: unknown } | null;
    response: Response;
    status: number;
  }>,
): Promise<T> {
  const { data, error, response, status } = await promise;
  if (error) {
    const v = error.value;
    const message =
      typeof v === "object" && v !== null && "error" in v ? String(v.error) : `API error ${status}`;
    throw new ApiError(status, message, response);
  }
  return data as T;
}
