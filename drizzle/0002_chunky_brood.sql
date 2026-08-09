CREATE TABLE "site_auth_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"auth_token" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
