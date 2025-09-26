ALTER TABLE "pointsHistory" ADD COLUMN "pointsType" text DEFAULT 'purchased' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "purchasedPoints" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "giftedPoints" integer DEFAULT 0;