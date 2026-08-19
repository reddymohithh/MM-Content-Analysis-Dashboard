ALTER TABLE "content_quality_scores" ADD COLUMN "batch_feedback" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "content_quality_scores" DROP COLUMN "narrative";--> statement-breakpoint
ALTER TABLE "content_quality_scores" DROP COLUMN "tips";