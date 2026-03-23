ALTER TABLE "payments" ADD COLUMN "amount_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "fee_amount_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "installment_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "installment_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "card_brand" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "card_last4" text;