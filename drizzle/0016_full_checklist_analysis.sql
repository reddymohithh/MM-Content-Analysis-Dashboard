ALTER TABLE "content_quality_scores" ADD COLUMN "analysis" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "content_quality_scores" DROP COLUMN "batch_feedback";