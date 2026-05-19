CREATE TYPE "public"."language" AS ENUM('estonian', 'latin', 'english');--> statement-breakpoint
CREATE TYPE "public"."life_admin_category" AS ENUM('documents', 'housing', 'finance', 'health', 'university', 'travel', 'other');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('watching', 'active', 'applied', 'won', 'passed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('research', 'internship', 'shadowing', 'conference', 'scholarship', 'volunteering', 'student_org', 'mentorship', 'clinical_exposure', 'language_course', 'other');--> statement-breakpoint
CREATE TYPE "public"."portfolio_item_type" AS ENUM('exam_result', 'project', 'presentation', 'certificate', 'research', 'volunteering', 'reflection', 'other');--> statement-breakpoint
CREATE TYPE "public"."portfolio_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."reputation_event_type" AS ENUM('helped_someone', 'excellent_work', 'presentation', 'project', 'exam_result', 'recommendation', 'reliability_signal', 'leadership_signal', 'precise_question_after_lecture');--> statement-breakpoint
CREATE TYPE "public"."strategic_review_type" AS ENUM('weekly', 'monthly', 'semester');--> statement-breakpoint
CREATE TYPE "public"."tartu_note_category" AS ENUM('estonian', 'tartu_life', 'academic_culture', 'medicine_dentistry_requirements', 'documents', 'housing', 'routine');--> statement-breakpoint
CREATE TYPE "public"."time_block_type" AS ENUM('study', 'review', 'simulation', 'recovery', 'life_admin', 'language', 'opportunity');--> statement-breakpoint
CREATE TABLE "health_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"sleep_quality" integer,
	"cognitive_fatigue" integer,
	"recovery_quality" integer,
	"food_quality" integer,
	"movement_done" boolean DEFAULT false NOT NULL,
	"energy_integrity_score" double precision DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "health_logs_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "language_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language" "language" DEFAULT 'estonian' NOT NULL,
	"title" varchar(220) NOT NULL,
	"category" varchar(120),
	"minutes" integer DEFAULT 0 NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"last_practiced_at" timestamp with time zone,
	"next_practice_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_admin_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"description" text,
	"category" "life_admin_category" DEFAULT 'other' NOT NULL,
	"due_at" timestamp with time zone,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"description" text,
	"opportunity_type" "opportunity_type" DEFAULT 'other' NOT NULL,
	"deadline" date,
	"value_score" integer DEFAULT 0 NOT NULL,
	"effort_score" integer DEFAULT 0 NOT NULL,
	"strategic_upside" integer DEFAULT 0 NOT NULL,
	"next_action" text,
	"status" "opportunity_status" DEFAULT 'watching' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"description" text,
	"item_type" "portfolio_item_type" DEFAULT 'other' NOT NULL,
	"date" date,
	"evidence_url" text,
	"strategic_value" integer DEFAULT 0 NOT NULL,
	"status" "portfolio_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(220) NOT NULL,
	"role" varchar(160),
	"institution" varchar(220),
	"relationship_strength" integer DEFAULT 0 NOT NULL,
	"last_contacted_at" timestamp with time zone,
	"next_follow_up_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reputation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"description" text,
	"event_type" "reputation_event_type" DEFAULT 'reliability_signal' NOT NULL,
	"event_date" date NOT NULL,
	"impact" integer DEFAULT 0 NOT NULL,
	"evidence_url" text,
	"follow_up_at" timestamp with time zone,
	"status" "task_status" DEFAULT 'done' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategic_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"review_type" "strategic_review_type" DEFAULT 'weekly' NOT NULL,
	"wins" text,
	"weaknesses" text,
	"decisions" text,
	"next_focus" text,
	"elite_index_snapshot" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tartu_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"content" text NOT NULL,
	"category" "tartu_note_category" DEFAULT 'tartu_life' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"title" varchar(220) NOT NULL,
	"block_type" time_block_type DEFAULT 'study' NOT NULL,
	"planned_minutes" integer DEFAULT 0 NOT NULL,
	"actual_minutes" integer DEFAULT 0 NOT NULL,
	"energy_cost" integer DEFAULT 0 NOT NULL,
	"leverage_score" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "error_logs" ADD COLUMN "recurrence_count" integer DEFAULT 0 NOT NULL;