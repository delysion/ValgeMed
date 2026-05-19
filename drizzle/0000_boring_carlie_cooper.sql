CREATE TYPE "public"."error_type" AS ENUM('memory', 'concept', 'distraction', 'anxiety', 'time', 'language', 'method', 'interpretation', 'calculation', 'other');--> statement-breakpoint
CREATE TYPE "public"."exam_format" AS ENUM('written', 'oral', 'practical', 'osce', 'mixed', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('daily', 'weekly', 'monthly', 'semester', 'identity', 'health', 'language', 'exam');--> statement-breakpoint
CREATE TYPE "public"."identity_category" AS ENUM('professional_identity', 'discipline', 'image', 'boundaries', 'ambition', 'tartu_life', 'language', 'personal_standard');--> statement-breakpoint
CREATE TYPE "public"."review_type" AS ENUM('flashcard', 'open_question', 'feynman', 'blurting', 'quiz_prompt');--> statement-breakpoint
CREATE TYPE "public"."study_method" AS ENUM('reading', 'active_recall', 'quiz', 'simulation', 'error_review', 'notes', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'doing', 'done', 'archived');--> statement-breakpoint
CREATE TYPE "public"."topic_status" AS ENUM('not_started', 'first_exposure', 'understood', 'recalled', 'practiced', 'error_corrected', 'consolidated', 'exam_ready');--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"sleep_hours" double precision,
	"energy_level" integer,
	"stress_level" integer,
	"mood_level" integer,
	"study_minutes" integer DEFAULT 0 NOT NULL,
	"active_recall_minutes" integer DEFAULT 0 NOT NULL,
	"passive_study_minutes" integer DEFAULT 0 NOT NULL,
	"movement_done" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_logs_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "error_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"topic_id" uuid,
	"exam_id" uuid,
	"title" varchar(220) NOT NULL,
	"description" text NOT NULL,
	"error_type" "error_type" DEFAULT 'other' NOT NULL,
	"cause" text,
	"correction" text,
	"prevention_rule" text,
	"retest_at" timestamp with time zone,
	"resolved" boolean DEFAULT false NOT NULL,
	"severity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"title" varchar(220) NOT NULL,
	"exam_date" timestamp with time zone,
	"ects" double precision,
	"format" "exam_format" DEFAULT 'unknown' NOT NULL,
	"difficulty" integer DEFAULT 0 NOT NULL,
	"importance" integer DEFAULT 0 NOT NULL,
	"readiness_score" double precision DEFAULT 0 NOT NULL,
	"risk_level" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"description" text,
	"goal_type" "goal_type" DEFAULT 'daily' NOT NULL,
	"target_date" date,
	"status" "goal_status" DEFAULT 'active' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"content" text NOT NULL,
	"category" "identity_category" DEFAULT 'professional_identity' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"topic_id" uuid,
	"exam_id" uuid,
	"date" date NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_answers" integer NOT NULL,
	"score_percent" double precision NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"topic_id" uuid,
	"question" text NOT NULL,
	"answer" text,
	"review_type" "review_type" DEFAULT 'flashcard' NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"interval_days" integer DEFAULT 1 NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"times_reviewed" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"topic_id" uuid,
	"exam_id" uuid,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_minutes" integer NOT NULL,
	"method" "study_method" DEFAULT 'mixed' NOT NULL,
	"focus_level" integer DEFAULT 0 NOT NULL,
	"energy_level" integer DEFAULT 0 NOT NULL,
	"output_quality" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"code" varchar(40),
	"description" text,
	"color" varchar(40),
	"difficulty" integer DEFAULT 0 NOT NULL,
	"importance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(220) NOT NULL,
	"description" text,
	"due_at" timestamp with time zone,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"related_subject_id" uuid,
	"related_exam_id" uuid,
	"related_topic_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"exam_id" uuid,
	"title" varchar(220) NOT NULL,
	"description" text,
	"status" "topic_status" DEFAULT 'not_started' NOT NULL,
	"difficulty" integer DEFAULT 0 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"last_studied_at" timestamp with time zone,
	"next_review_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_related_subject_id_subjects_id_fk" FOREIGN KEY ("related_subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_related_exam_id_exams_id_fk" FOREIGN KEY ("related_exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_related_topic_id_topics_id_fk" FOREIGN KEY ("related_topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;