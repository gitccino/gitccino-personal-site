CREATE TYPE "public"."comment_status" AS ENUM('visible', 'hidden');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"subject_key" text NOT NULL,
	"parent_id" uuid,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"status" "comment_status" DEFAULT 'visible' NOT NULL,
	"visitor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_key" text NOT NULL,
	"visitor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_subject_key_visitor_id_unique" UNIQUE("subject_key","visitor_id")
);
--> statement-breakpoint
CREATE INDEX "comments_subject_key_status_idx" ON "comments" USING btree ("subject_key","status");--> statement-breakpoint
CREATE INDEX "comments_visitor_id_idx" ON "comments" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "likes_subject_key_idx" ON "likes" USING btree ("subject_key");