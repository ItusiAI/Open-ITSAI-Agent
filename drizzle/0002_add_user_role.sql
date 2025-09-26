-- Add role column to users table
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user'; 