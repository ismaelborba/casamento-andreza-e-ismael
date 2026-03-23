CREATE TYPE "public"."asaas_environment" AS ENUM('sandbox', 'production');--> statement-breakpoint
CREATE TABLE "asaas_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"environment" "asaas_environment" DEFAULT 'sandbox' NOT NULL,
	"encrypted_api_key" text NOT NULL,
	"encrypted_webhook_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
