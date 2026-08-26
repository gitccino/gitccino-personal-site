import { createApp } from "./app";

// api require Upstash
if (!Bun.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("UPSTASH_REDIS_REST_URL is required");
}
if (!Bun.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_TOKEN is required");
}

const app = createApp();
const port = Number(Bun.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must contain a valid port number");
}

app.listen(port);

console.log(`API listening at ${app.server?.url}`);
