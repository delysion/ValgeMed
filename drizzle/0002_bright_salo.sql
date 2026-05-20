CREATE TABLE "hypotheses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"total_score" integer,
	"output" text,
	"status" text DEFAULT 'draft',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "literature_gaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_area_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 0,
	"publishable_for_student" boolean DEFAULT false,
	"status" text DEFAULT 'identified',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manuscripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"hypothesis_id" uuid,
	"stage" text DEFAULT 'idea' NOT NULL,
	"journal" text,
	"deadline" timestamp,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "methodology_risks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"manuscript_id" uuid,
	"hypothesis_id" uuid,
	"type" text NOT NULL,
	"description" text,
	"severity" text DEFAULT 'medium',
	"mitigated" boolean DEFAULT false,
	"mitigation_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"what_is_known" text,
	"what_is_unknown" text,
	"is_controversial" text,
	"methodologically_weak" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "literature_gaps" ADD CONSTRAINT "literature_gaps_research_area_id_research_areas_id_fk" FOREIGN KEY ("research_area_id") REFERENCES "public"."research_areas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manuscripts" ADD CONSTRAINT "manuscripts_hypothesis_id_hypotheses_id_fk" FOREIGN KEY ("hypothesis_id") REFERENCES "public"."hypotheses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "methodology_risks" ADD CONSTRAINT "methodology_risks_manuscript_id_manuscripts_id_fk" FOREIGN KEY ("manuscript_id") REFERENCES "public"."manuscripts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "methodology_risks" ADD CONSTRAINT "methodology_risks_hypothesis_id_hypotheses_id_fk" FOREIGN KEY ("hypothesis_id") REFERENCES "public"."hypotheses"("id") ON DELETE no action ON UPDATE no action;