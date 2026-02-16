CREATE TYPE "public"."issue_priority" AS ENUM('urgent', 'high', 'medium', 'low', 'none');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('open', 'in_progress', 'review', 'done', 'closed');--> statement-breakpoint
CREATE TYPE "public"."issue_type" AS ENUM('task', 'bug', 'feature', 'improvement');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."part_status" AS ENUM('draft', 'active', 'obsolete');--> statement-breakpoint
CREATE TABLE "labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7) NOT NULL,
	"description" varchar(255),
	CONSTRAINT "labels_project_name_idx" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE "issue_labels" (
	"issue_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	CONSTRAINT "issue_labels_pk" UNIQUE("issue_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp,
	"status" "milestone_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"part_number" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"status" "part_status" DEFAULT 'draft' NOT NULL,
	"current_revision_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_id" uuid NOT NULL,
	"revision_code" varchar(10) NOT NULL,
	"description" text,
	"changes" jsonb,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bom_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_part_id" uuid NOT NULL,
	"child_part_id" uuid NOT NULL,
	"quantity" varchar(10) DEFAULT '1' NOT NULL,
	"unit" varchar(20) DEFAULT 'EA' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_labels" ADD CONSTRAINT "issue_labels_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_labels" ADD CONSTRAINT "issue_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_parent_part_id_parts_id_fk" FOREIGN KEY ("parent_part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_child_part_id_parts_id_fk" FOREIGN KEY ("child_part_id") REFERENCES "public"."parts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "labels_project_idx" ON "labels" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "issue_labels_issue_idx" ON "issue_labels" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "issue_labels_label_idx" ON "issue_labels" USING btree ("label_id");--> statement-breakpoint
CREATE INDEX "milestones_project_idx" ON "milestones" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "milestones_status_idx" ON "milestones" USING btree ("status");