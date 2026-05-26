CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text,
	"approved" boolean DEFAULT false,
	"rejected_at" timestamp with time zone,
	"ai_provider" text,
	"ai_api_key" text,
	"is_admin" boolean DEFAULT false,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "display_name" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "approved" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "rejected_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "ai_provider" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "ai_api_key" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "is_admin" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "notified_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"extracted_text" text,
	"subject_id" uuid,
	"topic_id" uuid,
	"processed" boolean DEFAULT false NOT NULL,
	"flashcards_generated" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
DECLARE
	owner_id uuid;
	user_table text;
	user_tables text[] := ARRAY[
		'daily_logs',
		'error_logs',
		'exams',
		'goals',
		'health_logs',
		'hypotheses',
		'identity_notes',
		'language_progress',
		'life_admin_items',
		'literature_gaps',
		'manuscripts',
		'methodology_risks',
		'opportunities',
		'portfolio_items',
		'professional_contacts',
		'push_subscriptions',
		'quiz_attempts',
		'reputation_events',
		'research_areas',
		'review_items',
		'strategic_reviews',
		'study_sessions',
		'subjects',
		'tartu_notes',
		'tasks',
		'time_blocks',
		'topics',
		'uploads'
	];
BEGIN
	SELECT "id" INTO owner_id
	FROM "profiles"
	WHERE COALESCE("is_admin", false) = true
	ORDER BY COALESCE("approved", false) DESC, "created_at" NULLS LAST
	LIMIT 1;

	IF owner_id IS NULL THEN
		SELECT "id" INTO owner_id
		FROM "profiles"
		ORDER BY "created_at" NULLS LAST
		LIMIT 1;
	END IF;

	FOREACH user_table IN ARRAY user_tables LOOP
		EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "user_id" uuid', user_table);
	END LOOP;

	IF owner_id IS NOT NULL THEN
		FOREACH user_table IN ARRAY user_tables LOOP
			EXECUTE format('UPDATE %I SET "user_id" = $1 WHERE "user_id" IS NULL', user_table)
			USING owner_id;
		END LOOP;
	END IF;

	FOREACH user_table IN ARRAY user_tables LOOP
		EXECUTE format('ALTER TABLE %I ALTER COLUMN "user_id" SET NOT NULL', user_table);
	END LOOP;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "uploads" ADD CONSTRAINT "uploads_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	ALTER TABLE "uploads" ADD CONSTRAINT "uploads_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
