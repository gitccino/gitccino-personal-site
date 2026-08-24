import {
  pgTable,
  text,
  uuid,
  timestamp,
  unique,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const commentStatusEnum = pgEnum("comment_status", [
  "visible",
  "hidden",
]);

export const likes = pgTable(
  "likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectKey: text("subject_key").notNull(),
    visitorId: uuid("visitor_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("likes_subject_key_visitor_id_unique").on(
      table.subjectKey,
      table.visitorId,
    ),
    index("likes_subject_key_idx").on(table.subjectKey),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().notNull(),
    subjectKey: text("subject_key").notNull(),
    parentId: uuid("parent_id"),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    status: commentStatusEnum("status").default("visible").notNull(),
    visitorId: uuid("visitor_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("comments_subject_key_status_idx").on(table.subjectKey, table.status),
    index("comments_visitor_id_idx").on(table.visitorId), // can this person edit/delete this comment
  ],
);
