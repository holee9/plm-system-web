-- Add project visibility enum and column
-- Migration: 0004_add_project_visibility
-- Created: 2026-02-17

-- Create project_visibility enum type
CREATE TYPE "project_visibility" AS ENUM ('private', 'public');

-- Add visibility column to projects table
ALTER TABLE "projects" ADD COLUMN "visibility" "project_visibility" DEFAULT 'private' NOT NULL;

-- Create index for visibility filtering
CREATE INDEX IF NOT EXISTS "projects_visibility_idx" ON "projects"("visibility");

-- Add comment
COMMENT ON COLUMN "projects"."visibility" IS 'Project visibility: private (members only) or public';
