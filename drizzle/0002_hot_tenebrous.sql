CREATE TABLE "radar_article_authors" (
	"slug" varchar(500) NOT NULL,
	"author_name" varchar(255) NOT NULL,
	"author_user_id" uuid,
	"title" varchar(500),
	"kind" varchar(50) DEFAULT 'article' NOT NULL,
	"published_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "radar_article_authors_key" ON "radar_article_authors" USING btree ("slug","author_name");--> statement-breakpoint
CREATE INDEX "radar_article_authors_user_idx" ON "radar_article_authors" USING btree ("author_user_id");