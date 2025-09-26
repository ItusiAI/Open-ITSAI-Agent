CREATE TABLE IF NOT EXISTS "newsletterSubscriptions" (
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