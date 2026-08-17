ALTER TABLE "ad_campaigns" ADD COLUMN "bid_strategy" text;--> statement-breakpoint
ALTER TABLE "ad_campaigns" ADD COLUMN "daily_budget" double precision;--> statement-breakpoint
ALTER TABLE "ad_campaigns" ADD COLUMN "lifetime_budget" double precision;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "bid_strategy" text;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "daily_budget" double precision;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "lifetime_budget" double precision;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "optimization_goal" text;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "age_min" integer;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "age_max" integer;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "gender_label" text;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "locations" jsonb;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "interests" jsonb;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD COLUMN "platforms" jsonb;