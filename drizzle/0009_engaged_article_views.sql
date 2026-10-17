CREATE TABLE "article_metrics" (
	"article_id" varchar(128) PRIMARY KEY NOT NULL,
	"page_views" integer DEFAULT 0 NOT NULL,
	"engaged_views" integer DEFAULT 0 NOT NULL,
	"read_completions" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "view_receipts" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"counted_at" timestamp with time zone DEFAULT now() NOT NULL
);
