-- Existing single-column keys retain their CASCADE and SET NULL behavior.
CREATE TABLE "approval_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"approved" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "notification_claimed_until" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "exams_user_id_record_id_idx" ON "exams" USING btree ("user_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "hypotheses_user_id_record_id_idx" ON "hypotheses" USING btree ("user_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "manuscripts_user_id_record_id_idx" ON "manuscripts" USING btree ("user_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_areas_user_id_record_id_idx" ON "research_areas" USING btree ("user_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_user_id_record_id_idx" ON "subjects" USING btree ("user_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_user_id_record_id_idx" ON "topics" USING btree ("user_id","id");--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_subject_id_owner_fk" FOREIGN KEY ("user_id","subject_id") REFERENCES "public"."subjects"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_topic_id_owner_fk" FOREIGN KEY ("user_id","topic_id") REFERENCES "public"."topics"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_exam_id_owner_fk" FOREIGN KEY ("user_id","exam_id") REFERENCES "public"."exams"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_owner_fk" FOREIGN KEY ("user_id","subject_id") REFERENCES "public"."subjects"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "literature_gaps" ADD CONSTRAINT "literature_gaps_research_area_id_owner_fk" FOREIGN KEY ("user_id","research_area_id") REFERENCES "public"."research_areas"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "manuscripts" ADD CONSTRAINT "manuscripts_hypothesis_id_owner_fk" FOREIGN KEY ("user_id","hypothesis_id") REFERENCES "public"."hypotheses"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "methodology_risks" ADD CONSTRAINT "methodology_risks_manuscript_id_owner_fk" FOREIGN KEY ("user_id","manuscript_id") REFERENCES "public"."manuscripts"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "methodology_risks" ADD CONSTRAINT "methodology_risks_hypothesis_id_owner_fk" FOREIGN KEY ("user_id","hypothesis_id") REFERENCES "public"."hypotheses"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_subject_id_owner_fk" FOREIGN KEY ("user_id","subject_id") REFERENCES "public"."subjects"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_topic_id_owner_fk" FOREIGN KEY ("user_id","topic_id") REFERENCES "public"."topics"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_exam_id_owner_fk" FOREIGN KEY ("user_id","exam_id") REFERENCES "public"."exams"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_subject_id_owner_fk" FOREIGN KEY ("user_id","subject_id") REFERENCES "public"."subjects"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_topic_id_owner_fk" FOREIGN KEY ("user_id","topic_id") REFERENCES "public"."topics"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_subject_id_owner_fk" FOREIGN KEY ("user_id","subject_id") REFERENCES "public"."subjects"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_topic_id_owner_fk" FOREIGN KEY ("user_id","topic_id") REFERENCES "public"."topics"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_exam_id_owner_fk" FOREIGN KEY ("user_id","exam_id") REFERENCES "public"."exams"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_related_subject_id_owner_fk" FOREIGN KEY ("user_id","related_subject_id") REFERENCES "public"."subjects"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_related_exam_id_owner_fk" FOREIGN KEY ("user_id","related_exam_id") REFERENCES "public"."exams"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_related_topic_id_owner_fk" FOREIGN KEY ("user_id","related_topic_id") REFERENCES "public"."topics"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_id_owner_fk" FOREIGN KEY ("user_id","subject_id") REFERENCES "public"."subjects"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_exam_id_owner_fk" FOREIGN KEY ("user_id","exam_id") REFERENCES "public"."exams"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_subject_id_owner_fk" FOREIGN KEY ("user_id","subject_id") REFERENCES "public"."subjects"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_topic_id_owner_fk" FOREIGN KEY ("user_id","topic_id") REFERENCES "public"."topics"("user_id","id") ON DELETE no action ON UPDATE no action DEFERRABLE INITIALLY DEFERRED;
