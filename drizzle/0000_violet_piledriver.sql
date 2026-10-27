CREATE TABLE "radar_activity_days" (
	"user_id" uuid NOT NULL,
	"day" varchar(10) NOT NULL,
	"plays" integer DEFAULT 0 NOT NULL,
	"reads" integer DEFAULT 0 NOT NULL,
	"seconds" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_game_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game" varchar(100) NOT NULL,
	"puzzle_id" varchar(255),
	"score" integer NOT NULL,
	"meta" jsonb,
	"played_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" varchar(500) NOT NULL,
	"seconds" integer DEFAULT 0 NOT NULL,
	"read_count" integer DEFAULT 1 NOT NULL,
	"first_read_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "radar_activity_days_user_day_key" ON "radar_activity_days" USING btree ("user_id","day");--> statement-breakpoint
CREATE INDEX "radar_activity_days_day_idx" ON "radar_activity_days" USING btree ("day");--> statement-breakpoint
CREATE INDEX "radar_game_scores_user_idx" ON "radar_game_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "radar_game_scores_game_idx" ON "radar_game_scores" USING btree ("game");--> statement-breakpoint
CREATE UNIQUE INDEX "radar_reads_user_slug_key" ON "radar_reads" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "radar_reads_user_idx" ON "radar_reads" USING btree ("user_id");