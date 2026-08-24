import { Elysia, t } from "elysia";
import { cors } from "@elysia/cors";

import { visitorContext } from "./plugins/visitor";
import { likesRoutes } from "./routes/like";
import { commentsRoutes } from "./routes/comments";
import { createWriteRateLimiter } from "./plugins/rate-limit";

// /.*\.gitccino\.com$/
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
  .use(createWriteRateLimiter())
  .use(visitorContext)
  .use(likesRoutes)
  .use(commentsRoutes)
  .get("/health", () => ({ status: "ok" }) as const, {
    response: t.Object({ status: t.Literal("ok") }),
  });
