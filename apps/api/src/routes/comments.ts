import { and, asc, desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { requireVisitorId, visitorContext } from "../plugins/visitor";
import { db } from "../db/client";
import { comments } from "../db/schema";
import {
  errorResponseSchema,
  honeypotSchema,
  subjectSchema,
} from "../http/schemas";
import { createAuthorName } from "../lib/author-name";

const nullableUuidSchema = t.Union([t.String({ format: "uuid" }), t.Null()]);

const commentResponseSchema = t.Object({
  id: t.String({ format: "uuid" }),
  parentId: nullableUuidSchema,
  authorName: t.String(),
  body: t.String(),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
  canDelete: t.Boolean(),
});

function toCommentResponse(
  comment: typeof comments.$inferSelect,
  visitorId: string | null,
) {
  return {
    id: comment.id,
    parentId: comment.parentId,
    authorName: comment.authorName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    canDelete: visitorId === comment.visitorId,
  };
}

export const commentsRoutes = new Elysia({ name: "comments-routes" })
  .use(visitorContext)
  .get(
    "/comments",
    async ({ query, visitorId }) => {
      const rows = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.subjectKey, query.subject),
            eq(comments.status, "visible"),
          ),
        )
        .orderBy(desc(comments.createdAt), desc(comments.id));

      return rows.map((comment) => toCommentResponse(comment, visitorId));
    },
    {
      query: t.Object({ subject: subjectSchema }),
      response: t.Array(commentResponseSchema),
    },
  )
  .post(
    "/comments",
    async ({ body: input, visitorId, cookie: { visitor_id }, status }) => {
      if (input.website) {
        return status(400, { error: "Bot submission rejected" });
      }

      const normalizeBody = input.body.trim();

      if (!normalizeBody) {
        return status(400, { error: "Comment body is required" });
      }

      const requiredVisitorId = requireVisitorId(visitorId, visitor_id!);

      // retrieve the prev author name if existed
      const priorComments = await db
        .select({ authorName: comments.authorName })
        .from(comments)
        .where(eq(comments.visitorId, requiredVisitorId))
        .orderBy(asc(comments.createdAt), asc(comments.id))
        .limit(1);
      const authorName = priorComments[0]?.authorName ?? createAuthorName();

      const createdComments = await db
        .insert(comments)
        .values({
          subjectKey: input.subject,
          authorName,
          body: normalizeBody,
          visitorId: requiredVisitorId,
        })
        .returning();
      const createdComment = createdComments[0];

      if (!createdComment) {
        throw new Error("Comment insert returned no row");
      }

      return toCommentResponse(createdComment, requiredVisitorId);
    },
    {
      body: t.Object({
        subject: subjectSchema,
        body: t.String({ minLength: 1, maxLength: 2000 }),
        website: honeypotSchema,
      }),
      response: {
        200: commentResponseSchema,
        400: errorResponseSchema,
      },
    },
  )
  .delete(
    "/comments/:id",
    async ({ params, visitorId, status }) => {
      if (!visitorId) {
        return status(401, { error: "Visitor identity required" });
      }

      const deletedComments = await db
        .delete(comments)
        .where(
          and(eq(comments.id, params.id), eq(comments.visitorId, visitorId)),
        )
        .returning({ id: comments.id });

      if (deletedComments.length === 0) {
        return status(404, { error: "Comment not found" });
      }

      return { deleted: true } as const;
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid" }),
      }),
      response: {
        200: t.Object({ deleted: t.Literal(true) }),
        401: errorResponseSchema,
        404: errorResponseSchema,
      },
    },
  );
