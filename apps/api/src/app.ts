import { Elysia, t } from "elysia";
import { cors } from "@elysia/cors";

import { visitorContext } from "./plugins/visitor";

const webOrigin = Bun.env.WEB_ORIGIN ?? "http://localhost:5173";

export const app = new Elysia()
  .use(
    cors({
      origin: webOrigin,
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type"],
    }),
  )
  .use(visitorContext)
  .get("/health", () => ({ status: "ok" }) as const, {
    response: t.Object({ status: t.Literal("ok") }),
  });
