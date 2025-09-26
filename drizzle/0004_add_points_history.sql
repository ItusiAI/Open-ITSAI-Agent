-- Create points history table
CREATE TABLE "pointsHistory" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "points" integer NOT NULL,
  "action" text NOT NULL,
  "description" text,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "pointsHistory" ADD CONSTRAINT "pointsHistory_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action; 