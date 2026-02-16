import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

// Issue priority values
export const issuePriorityValues = ["critical", "high", "medium", "low"] as const;
export const issueTypeValues = ["bug", "story", "task", "epic"] as const;
export const issueStatusValues = ["todo", "inProgress", "inReview", "done"] as const;

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: issueTypeValues }).notNull().default("task"),
  priority: text("priority", { enum: issuePriorityValues }).notNull().default("medium"),
  status: text("status", { enum: issueStatusValues }).notNull().default("todo"),
  assigneeId: integer("assignee_id").references(() => users.id, { onDelete: "set null" }),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: "set null" }),
  projectId: integer("project_id").references(() => users.id, { onDelete: "set null" }),
  labels: text("labels"), // JSON string array
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;

export const issueComments = pgTable("issue_comments", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type IssueComment = typeof issueComments.$inferSelect;
export type NewIssueComment = typeof issueComments.$inferInsert;

export const issueActivities = pgTable("issue_activities", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  field: text("field").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IssueActivity = typeof issueActivities.$inferSelect;
export type NewIssueActivity = typeof issueActivities.$inferInsert;
