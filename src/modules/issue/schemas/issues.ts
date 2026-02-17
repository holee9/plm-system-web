// Issue table schema
import { pgTable, uuid, varchar, text, integer, pgEnum, index, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "../../../server/db/projects";
import { users } from "../../../server/db/users";

// Issue status enum
export const issueStatusEnum = pgEnum("issue_status", [
  "open",
  "in_progress",
  "review",
  "done",
  "closed",
]);

// Issue priority enum
export const issuePriorityEnum = pgEnum("issue_priority", [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
]);

// Issue type enum
export const issueTypeEnum = pgEnum("issue_type", [
  "task",
  "bug",
  "feature",
  "improvement",
]);

// Issues table
export const issues = pgTable("issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  number: integer("number").notNull(), // Sequential within project
  key: varchar("key", { length: 50 }).notNull().unique(), // e.g., PLM-1
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: issueStatusEnum("status").default("open").notNull(),
  priority: issuePriorityEnum("priority").default("none").notNull(),
  type: issueTypeEnum("type").default("task").notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  // milestoneId references will be set up in a separate file to avoid circular dependency
  milestoneId: uuid("milestone_id"), // References will be set up in milestones.ts
  parentId: uuid("parent_id"), // Self-reference will be added dynamically
  position: integer("position").default(0).notNull(), // Kanban ordering
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Composite unique constraint for project + number
  projectNumberIdx: index("issues_project_number_idx").on(table.projectId, table.number),
  // Index for key lookups (e.g., PLM-1)
  keyIdx: index("issues_key_idx").on(table.key),
  // Index for status filtering
  statusIdx: index("issues_status_idx").on(table.status),
  // Index for assignee filtering
  assigneeIdx: index("issues_assignee_idx").on(table.assigneeId),
  // Index for project listing
  projectIdx: index("issues_project_idx").on(table.projectId),
  // Index for milestone filtering
  milestoneIdx: index("issues_milestone_idx").on(table.milestoneId),
}));

// Type inference - internal only, use types from types.ts instead
type Issue = typeof issues.$inferSelect;
type NewIssue = typeof issues.$inferInsert;
