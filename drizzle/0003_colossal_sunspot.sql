CREATE TYPE "public"."site_page_version_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "site_page_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"status" "site_page_version_status" DEFAULT 'draft' NOT NULL,
	"theme_json" jsonb NOT NULL,
	"document_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "site_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"published_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "site_page_versions" ADD CONSTRAINT "site_page_versions_page_id_site_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;