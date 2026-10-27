CREATE TABLE "radar_read_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"seconds" integer DEFAULT 0 NOT NULL,
	"max_scroll" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "radar_read_sessions_identity_key" ON "radar_read_sessions" USING btree ("user_id","session_id","slug");