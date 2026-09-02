import { and, asc, desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { requireVisitorId, visitorContext } from "../plugins/visitor";
import { db } from "../db/client";
import { comments } from "../db/schema";
import { errorResponseSchema, honeypotSchema, subjectSchema } from "../http/schemas";
import { createAuthorName } from "../lib/author-name";

const nullableUuidSchema = t.Union([t.String({ format: "uuid" }), t.Null()]);

const commentResponseSchema = t.Object({
  id: t.String({ format: "uuid" }),
  parentId: nullableUuidSchema,
  authorName: t.String(),
  body: t.String(),
  deleted: t.Boolean(),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
  canDelete: t.Boolean(),
});

function toCommentResponse(comment: typeof comments.$inferSelect, visitorId: string | null) {
  const deleted = comment.status === "hidden";
  return {
    id: comment.id,
    parentId: comment.parentId,
    authorName: comment.authorName,
    body: comment.body,
    deleted,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    canDelete: deleted ? false : visitorId === comment.visitorId,
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
        .where(eq(comments.subjectKey, query.subject))
        .orderBy(desc(comments.createdAt), desc(comments.id));

      const parentsWithReplies = new Set(
        rows.filter((r) => r.parentId && r.status === "visible").map((r) => r.parentId!),
      );
      const visible = rows.filter(
        (r) => r.status === "visible" || parentsWithReplies.has(r.id),
      );

      return visible.map((comment) => toCommentResponse(comment, visitorId));
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

      if (input.parentId) {
        const parents = await db
          .select({ parentId: comments.parentId, subjectKey: comments.subjectKey, status: comments.status })
          .from(comments)
          .where(eq(comments.id, input.parentId))
          .limit(1);
        const parent = parents[0];

        if (!parent || parent.status !== "visible") {
          return status(400, { error: "Parent comment not found" });
        }
        if (parent.subjectKey !== input.subject) {
          return status(400, { error: "Parent comment belongs to another subject" });
        }
        if (parent.parentId !== null) {
          return status(400, { error: "Replies cannot be nested" });
        }
      }

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
          parentId: input.parentId ?? null,
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
        parentId: t.Optional(t.String({ format: "uuid" })),
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

      // A root with visible replies is hidden, not removed.
      const replies = await db
        .select({ id: comments.id })
        .from(comments)
        .where(and(eq(comments.parentId, params.id), eq(comments.status, "visible")))
        .limit(1);

      if (replies.length > 0) {
        const hidden = await db
          .update(comments)
          .set({ body: "", status: "hidden", updatedAt: new Date() })
          .where(and(eq(comments.id, params.id), eq(comments.visitorId, visitorId)))
          .returning({ id: comments.id });

        if (hidden.length === 0) return status(404, { error: "Comment not found" });
        return { deleted: true } as const;
      }

      // Leaf: hard-delete.
      const deletedComments = await db
        .delete(comments)
        .where(and(eq(comments.id, params.id), eq(comments.visitorId, visitorId)))
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
