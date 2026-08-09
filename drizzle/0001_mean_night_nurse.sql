CREATE TABLE "content_quality_scores" (
	"edition_id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"total" double precision NOT NULL,
	"categories" jsonb NOT NULL,
	"narrative" text NOT NULL,
	"scored_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "editions" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "content_quality_scores" ADD CONSTRAINT "content_quality_scores_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;