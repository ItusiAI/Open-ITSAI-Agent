-- Add points column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "points" integer DEFAULT 0; 