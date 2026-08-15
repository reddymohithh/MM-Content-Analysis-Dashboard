CREATE TABLE "ad_meta_totals" (
	"id" text PRIMARY KEY NOT NULL,
	"spend" double precision NOT NULL,
	"leads" integer NOT NULL,
	"impressions" integer NOT NULL,
	"link_clicks" integer NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
