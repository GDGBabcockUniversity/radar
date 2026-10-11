CREATE TABLE "radar_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"profile_picture" text,
	"source_updated_at" timestamp with time zone NOT NULL
);
