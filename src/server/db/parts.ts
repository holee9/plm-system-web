import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";
import { users } from "./users";

// Part status enum
export const partStatusEnum = pgEnum("part_status", ["draft", "active", "obsolete"]);

// Parts table
export const parts = pgTable("parts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  partNumber: varchar("part_number", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  status: partStatusEnum("status").default("draft").notNull(),
  currentRevisionId: uuid("current_revision_id"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: part number must be unique within project
  uniqueProjectPartNumber: sql`UNIQUE(table.project_id, table.part_number)`,
  // Index for project lookups
  projectIdx: sql`CREATE INDEX IF NOT EXISTS parts_project_id_idx ON parts(project_id)`,
  // Index for part number searches
  partNumberIdx: sql`CREATE INDEX IF NOT EXISTS parts_part_number_idx ON parts(part_number)`,
  // Index for status filtering
  statusIdx: sql`CREATE INDEX IF NOT EXISTS parts_status_idx ON parts(status)`,
  // Index for current revision lookups
  currentRevisionIdx: sql`CREATE INDEX IF NOT EXISTS parts_current_revision_id_idx ON parts(current_revision_id)`,
}));

// Type inference
export type Part = typeof parts.$inferSelect;
export type NewPart = typeof parts.$inferInsert;
