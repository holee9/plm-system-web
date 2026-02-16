import { pgTable, uuid, pgEnum, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";
import { users } from "./users";

// Project member role enum
export const projectMemberRoleEnum = pgEnum("project_member_role", ["admin", "member", "viewer"]);

// Project members table - junction table for users and projects
export const projectMembers = pgTable("project_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: projectMemberRoleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint on (project_id, user_id)
  uniqueProjectUser: unique("unique_project_user").on(table.projectId, table.userId),
  // Index for project members lookup
  projectIdx: sql`CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON project_members(project_id)`,
  // Index for user projects lookup
  userIdx: sql`CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON project_members(user_id)`,
}));

// Type inference
export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
