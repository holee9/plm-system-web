import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { teams } from "./teams";

// Project status enum
export const projectStatusEnum = pgEnum("project_status", ["active", "archived"]);

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 10 }).notNull().unique(),
  description: text("description"),
  status: projectStatusEnum("status").default("active").notNull(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Index for faster lookups by key
  keyIdx: sql`CREATE INDEX IF NOT EXISTS projects_key_idx ON projects(key)`,
  // Index for team projects
  teamIdx: sql`CREATE INDEX IF NOT EXISTS projects_team_id_idx ON projects(team_id)`,
  // Index for user's projects
  createdByIdx: sql`CREATE INDEX IF NOT EXISTS projects_created_by_idx ON projects(created_by)`,
  // Index for status filtering
  statusIdx: sql`CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status)`,
}));

// Type inference
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
