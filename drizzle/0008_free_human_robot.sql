CREATE TABLE "anonymous_views" (
	"fingerprint" varchar(64) PRIMARY KEY NOT NULL,
	"slug" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "radar_anonymous_views_slug_idx" ON "anonymous_views" USING btree ("slug");