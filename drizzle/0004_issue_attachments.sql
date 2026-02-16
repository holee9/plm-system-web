-- Issue Attachments Migration
-- SPEC-PLM-002: Issue Attachments

-- Create issue_attachments table
CREATE TABLE "issue_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"file_size" bigint NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for issue_attachments
CREATE INDEX "issue_attachments_issue_idx" ON "issue_attachments"("issue_id");
CREATE INDEX "issue_attachments_uploaded_by_idx" ON "issue_attachments"("uploaded_by");

-- Add foreign key constraints
ALTER TABLE "issue_attachments" ADD CONSTRAINT "issue_attachments_issue_id_issues_id_fk"
	FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;

-- Note: Foreign key constraint to users table is omitted due to schema inconsistency
-- (users table uses integer id, while issue_attachments uses uuid)
-- User validation will be handled at the application layer
-- This should be addressed in a future schema migration
