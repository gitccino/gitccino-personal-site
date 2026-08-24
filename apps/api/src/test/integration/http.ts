import { app } from "./setup";

export function request(path: string, init: RequestInit = {}) {
  return app.handle(new Request(`http://localhost${path}`, init));
}

export function jsonRequest(
  path: string,
  method: "POST" | "DELETE",
  body?: unknown,
  cookie?: string,
) {
  const headers = new Headers();

  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }

  if (cookie) {
    headers.set("cookie", cookie);
  }

  return request(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function readCookie(response: Response): string {
  const setCookie = response.headers.get("set-cookie");

  if (!setCookie) {
    throw new Error("Expected the response to set a cookie");
  }

  const cookie = setCookie.split(";", 1)[0];

  if (!cookie) {
    throw new Error("Set-Cookie contained no cookie value");
  }

  return cookie;
}
