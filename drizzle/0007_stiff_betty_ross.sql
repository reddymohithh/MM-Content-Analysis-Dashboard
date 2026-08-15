CREATE TABLE "ad_daily_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"ad_id" text NOT NULL,
	"date" text NOT NULL,
	"spend" double precision NOT NULL,
	"leads" integer NOT NULL,
	"impressions" integer NOT NULL,
	"link_clicks" integer NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "ad_meta_totals" CASCADE;--> statement-breakpoint
ALTER TABLE "ad_daily_metrics" ADD CONSTRAINT "ad_daily_metrics_ad_id_meta_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."meta_ads"("id") ON DELETE cascade ON UPDATE no action;