// Milestones table schema
import { pgTable, uuid, varchar, text, pgEnum, timestamp, index } from "drizzle-orm/pg-core";
import { projects } from "../../../server/db/projects";

// Milestone status enum
export const milestoneStatusEnum = pgEnum("milestone_status", ["open", "closed"]);

// Milestones table (project-scoped)
export const milestones = pgTable("milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: milestoneStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Index for project milestones listing
  projectIdx: index("milestones_project_idx").on(table.projectId),
  // Index for status filtering
  statusIdx: index("milestones_status_idx").on(table.status),
}));

// Type inference - internal only, use types from types.ts instead
type Milestone = typeof milestones.$inferSelect;
type NewMilestone = typeof milestones.$inferInsert;
