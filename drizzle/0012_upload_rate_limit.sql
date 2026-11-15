CREATE TABLE "upload_daily_limits" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"day" date NOT NULL,
	"attempts" integer NOT NULL
);
