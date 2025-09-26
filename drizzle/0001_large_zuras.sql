CREATE TABLE "newsletterSubscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"isActive" boolean DEFAULT true,
	"locale" text DEFAULT 'zh' NOT NULL,
	"subscribedAt" timestamp DEFAULT now(),
	"unsubscribedAt" timestamp,
	"unsubscribeToken" text,
	CONSTRAINT "newsletterSubscriptions_email_unique" UNIQUE("email"),
	CONSTRAINT "newsletterSubscriptions_unsubscribeToken_unique" UNIQUE("unsubscribeToken")
);
--> statement-breakpoint
CREATE TABLE "pointsHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"points" integer NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "points" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripeCustomerId" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscriptionId" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscriptionStatus" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscriptionPlan" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscriptionCurrentPeriodEnd" timestamp;--> statement-breakpoint
ALTER TABLE "pointsHistory" ADD CONSTRAINT "pointsHistory_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;