import Elysia, { t } from "elysia";
import { requireVisitorId, visitorContext } from "../plugins/visitor";
import { errorResponseSchema, honeypotSchema, subjectSchema } from "../http/schemas";
import { db } from "../db/client";
import { count, eq, and } from "drizzle-orm";
import { likes } from "../db/schema";

const likeResponseSchema = t.Object({
  count: t.Integer({ minimum: 0 }),
  liked: t.Boolean(),
});

async function getLikeState(subject: string, visitorId: string | null) {
  const countRows = await db
    .select({ value: count() })
    .from(likes)
    .where(eq(likes.subjectKey, subject));

  const likeCount = countRows[0]?.value ?? 0;

  if (!visitorId) {
    return { count: likeCount, liked: false };
  }

  const existingLikes = await db
    .select({ id: likes.id })
    .from(likes)
    .where(and(eq(likes.subjectKey, subject), eq(likes.visitorId, visitorId)))
    .limit(1);

  return {
    count: likeCount,
    liked: existingLikes.length > 0,
  };
}

export const likesRoutes = new Elysia({ name: "likes-routes" })
  .use(visitorContext)
  .get("/likes", ({ query, visitorId }) => getLikeState(query.subject, visitorId), {
    query: t.Object({ subject: subjectSchema }),
    response: likeResponseSchema,
  })
  .post(
    "/likes",
    async ({ body, visitorId, cookie: { visitor_id }, status }) => {
      if (body.website) {
        return status(400, { error: "Bot submission rejected" });
      }

      const requiredVisitorId = requireVisitorId(visitorId, visitor_id!);

      return db.transaction(async (transaction) => {
        const removedLikes = await transaction
          .delete(likes)
          .where(and(eq(likes.subjectKey, body.subject), eq(likes.visitorId, requiredVisitorId)))
          .returning({ id: likes.id });

        let liked = false;

        if (removedLikes.length === 0) {
          await transaction
            .insert(likes)
            .values({
              subjectKey: body.subject,
              visitorId: requiredVisitorId,
            })
            .onConflictDoNothing({
              target: [likes.subjectKey, likes.visitorId],
            });

          liked = true;
        }

        const countRows = await transaction
          .select({ value: count() })
          .from(likes)
          .where(eq(likes.subjectKey, body.subject));

        return {
          count: countRows[0]?.value ?? 0,
          liked,
        };
      });
    },
    {
      body: t.Object({
        subject: subjectSchema,
        website: honeypotSchema,
      }),
      response: {
        200: likeResponseSchema,
        400: errorResponseSchema,
      },
    },
  );
