CREATE TABLE "ai_usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"feature" varchar(100) NOT NULL,
	"provider" varchar(40) NOT NULL,
	"prompt_chars" integer DEFAULT 0 NOT NULL,
	"response_chars" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "ai_daily_request_limit" integer DEFAULT 40 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "ai_daily_char_limit" integer DEFAULT 240000 NOT NULL;--> statement-breakpoint
CREATE INDEX "ai_usage_events_user_id_created_idx" ON "ai_usage_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_events_user_id_feature_created_idx" ON "ai_usage_events" USING btree ("user_id","feature","created_at");