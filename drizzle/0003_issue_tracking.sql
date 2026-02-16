-- Issue Tracking Core Migration
-- SPEC-PLM-004: Issue Tracking Core

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS "issue_labels" CASCADE;
DROP TABLE IF EXISTS "issue_comments" CASCADE;
DROP TABLE IF EXISTS "issues" CASCADE;
DROP TABLE IF EXISTS "labels" CASCADE;
DROP TABLE IF EXISTS "milestones" CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS "issue_status" CASCADE;
DROP TYPE IF EXISTS "issue_priority" CASCADE;
DROP TYPE IF EXISTS "issue_type" CASCADE;
DROP TYPE IF EXISTS "milestone_status" CASCADE;

-- Create issue status enum
CREATE TYPE "issue_status" AS ENUM('open', 'in_progress', 'review', 'done', 'closed');

-- Create issue priority enum
CREATE TYPE "issue_priority" AS ENUM('urgent', 'high', 'medium', 'low', 'none');

-- Create issue type enum
CREATE TYPE "issue_type" AS ENUM('task', 'bug', 'feature', 'improvement');

-- Create milestone status enum
CREATE TYPE "milestone_status" AS ENUM('open', 'closed');

-- Create issues table
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"key" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" "issue_status" DEFAULT 'open' NOT NULL,
	"priority" "issue_priority" DEFAULT 'none' NOT NULL,
	"type" "issue_type" DEFAULT 'task' NOT NULL,
	"assignee_id" uuid,
	"reporter_id" uuid NOT NULL,
	"milestone_id" uuid,
	"parent_id" uuid,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "issues_key_unique" UNIQUE("key")
);

-- Create indexes for issues
CREATE INDEX "issues_project_number_idx" ON "issues"("project_id", "number");
CREATE INDEX "issues_key_idx" ON "issues"("key");
CREATE INDEX "issues_status_idx" ON "issues"("status");
CREATE INDEX "issues_assignee_idx" ON "issues"("assignee_id");
CREATE INDEX "issues_project_idx" ON "issues"("project_id");
CREATE INDEX "issues_milestone_idx" ON "issues"("milestone_id");

-- Create issue_comments table
CREATE TABLE "issue_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for issue_comments
CREATE INDEX "issue_comments_issue_idx" ON "issue_comments"("issue_id");
CREATE INDEX "issue_comments_author_idx" ON "issue_comments"("author_id");

-- Create labels table
CREATE TABLE "labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7) NOT NULL,
	"description" varchar(255),
	CONSTRAINT "labels_project_name_idx" UNIQUE("project_id", "name")
);

-- Create indexes for labels
CREATE INDEX "labels_project_idx" ON "labels"("project_id");

-- Create issue_labels junction table
CREATE TABLE "issue_labels" (
	"issue_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	CONSTRAINT "issue_labels_pk" UNIQUE("issue_id", "label_id")
);

-- Create indexes for issue_labels
CREATE INDEX "issue_labels_issue_idx" ON "issue_labels"("issue_id");
CREATE INDEX "issue_labels_label_idx" ON "issue_labels"("label_id");

-- Create milestones table
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp,
	"status" "milestone_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for milestones
CREATE INDEX "milestones_project_idx" ON "milestones"("project_id");
CREATE INDEX "milestones_status_idx" ON "milestones"("status");

-- Add foreign key constraints (only for projects table which already uses UUID)
ALTER TABLE "issues" ADD CONSTRAINT "issues_project_id_projects_id_fk"
	FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "issues" ADD CONSTRAINT "issues_parent_id_issues_id_fk"
	FOREIGN KEY ("parent_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "issue_comments" ADD CONSTRAINT "issue_comments_issue_id_issues_id_fk"
	FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "labels" ADD CONSTRAINT "labels_project_id_projects_id_fk"
	FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "issue_labels" ADD CONSTRAINT "issue_labels_issue_id_issues_id_fk"
	FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "issue_labels" ADD CONSTRAINT "issue_labels_label_id_labels_id_fk"
	FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk"
	FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;

-- Note: Foreign key constraints to users table are omitted due to schema inconsistency
-- (users table uses integer id, while issue tables use uuid)
-- User validation will be handled at the application layer
-- This should be addressed in a future schema migration
