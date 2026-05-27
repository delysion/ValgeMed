ALTER TABLE "profiles" ADD COLUMN "target_level" text DEFAULT 'top_5' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "weakness_tolerance" text DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "exam_strategy" text DEFAULT 'balanced' NOT NULL;