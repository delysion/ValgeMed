ALTER TABLE "daily_logs" DROP CONSTRAINT "daily_logs_date_unique";--> statement-breakpoint
ALTER TABLE "health_logs" DROP CONSTRAINT "health_logs_date_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "daily_logs_user_id_date_unique" ON "daily_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "error_logs_user_id_resolved_severity_created_idx" ON "error_logs" USING btree ("user_id","resolved","severity","created_at");--> statement-breakpoint
CREATE INDEX "exams_user_id_exam_date_idx" ON "exams" USING btree ("user_id","exam_date");--> statement-breakpoint
CREATE INDEX "goals_user_id_priority_created_idx" ON "goals" USING btree ("user_id","priority","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "health_logs_user_id_date_unique" ON "health_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "hypotheses_user_id_created_idx" ON "hypotheses" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "identity_notes_user_id_created_idx" ON "identity_notes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "language_progress_user_id_next_practice_idx" ON "language_progress" USING btree ("user_id","next_practice_at","created_at");--> statement-breakpoint
CREATE INDEX "life_admin_items_user_id_priority_due_idx" ON "life_admin_items" USING btree ("user_id","priority","due_at");--> statement-breakpoint
CREATE INDEX "literature_gaps_user_id_priority_created_idx" ON "literature_gaps" USING btree ("user_id","priority","created_at");--> statement-breakpoint
CREATE INDEX "manuscripts_user_id_deadline_idx" ON "manuscripts" USING btree ("user_id","deadline");--> statement-breakpoint
CREATE INDEX "methodology_risks_user_id_created_idx" ON "methodology_risks" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "opportunities_user_id_deadline_upside_idx" ON "opportunities" USING btree ("user_id","deadline","strategic_upside");--> statement-breakpoint
CREATE INDEX "portfolio_items_user_id_date_created_idx" ON "portfolio_items" USING btree ("user_id","date","created_at");--> statement-breakpoint
CREATE INDEX "professional_contacts_user_id_strength_followup_idx" ON "professional_contacts" USING btree ("user_id","relationship_strength","next_follow_up_at");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_endpoint_idx" ON "push_subscriptions" USING btree ("user_id","endpoint");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_id_date_idx" ON "quiz_attempts" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "reputation_events_user_id_event_impact_idx" ON "reputation_events" USING btree ("user_id","event_date","impact");--> statement-breakpoint
CREATE INDEX "research_areas_user_id_created_idx" ON "research_areas" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "review_items_user_id_active_due_idx" ON "review_items" USING btree ("user_id","is_active","due_at");--> statement-breakpoint
CREATE INDEX "strategic_reviews_user_id_date_idx" ON "strategic_reviews" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "study_sessions_user_id_started_at_idx" ON "study_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "subjects_user_id_name_idx" ON "subjects" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "tartu_notes_user_id_priority_created_idx" ON "tartu_notes" USING btree ("user_id","priority","created_at");--> statement-breakpoint
CREATE INDEX "tasks_user_id_priority_due_idx" ON "tasks" USING btree ("user_id","priority","due_at");--> statement-breakpoint
CREATE INDEX "time_blocks_user_id_date_created_idx" ON "time_blocks" USING btree ("user_id","date","created_at");--> statement-breakpoint
CREATE INDEX "topics_user_id_priority_title_idx" ON "topics" USING btree ("user_id","priority","title");--> statement-breakpoint
CREATE INDEX "topics_user_id_subject_id_idx" ON "topics" USING btree ("user_id","subject_id");--> statement-breakpoint
CREATE INDEX "uploads_user_id_created_idx" ON "uploads" USING btree ("user_id","created_at");