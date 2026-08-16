CREATE TABLE "beehiiv_meta_source_daily_counts" (
	"date" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
