import { app } from "./app";

const port = Number(Bun.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must contain a valid port number");
}

app.listen(port);

console.log(`API listening at ${app.server?.url}`);
