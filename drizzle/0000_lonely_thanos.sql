CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"author" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editions" (
	"id" text PRIMARY KEY NOT NULL,
	"publication_id" text NOT NULL,
	"subject" text NOT NULL,
	"preview" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"open_rate" double precision NOT NULL,
	"ctr_raw" double precision NOT NULL,
	"ctr_verified" double precision NOT NULL,
	"unsub_rate" double precision NOT NULL,
	"spam_rate" double precision DEFAULT 0,
	"avg_sentence_length" double precision,
	"banned_phrase_hits" integer,
	"hook_type" text,
	"has_emoji" boolean DEFAULT false NOT NULL,
	"has_number" boolean DEFAULT false NOT NULL,
	"char_length" integer NOT NULL,
	"data_source" text NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_tallies" (
	"edition_id" text PRIMARY KEY NOT NULL,
	"total" integer,
	"loved_it" integer,
	"pretty_useful" integer,
	"it_was_okay" integer,
	"not_helpful" integer,
	"exact" boolean DEFAULT false NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "promoted_links" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"sponsor" text NOT NULL,
	"description" text NOT NULL,
	"clicks" integer NOT NULL,
	"unique_clicks" integer
);
--> statement-breakpoint
CREATE TABLE "publication_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"publication_id" text NOT NULL,
	"name" text NOT NULL,
	"active_subscribers" integer NOT NULL,
	"open_rate" double precision NOT NULL,
	"click_rate" double precision NOT NULL,
	"new_subscribers" integer NOT NULL,
	"churned_subscribers" integer NOT NULL,
	"net_subscribers" integer NOT NULL,
	"data_source" text NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "top_links" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"clicks" integer NOT NULL,
	"rank" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_tallies" ADD CONSTRAINT "poll_tallies_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promoted_links" ADD CONSTRAINT "promoted_links_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "top_links" ADD CONSTRAINT "top_links_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;