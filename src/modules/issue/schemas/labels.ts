// Labels table schema
import { pgTable, uuid, varchar, text, unique, index } from "drizzle-orm/pg-core";
import { projects } from "../../../server/db/projects";

// Labels table (project-scoped)
export const labels = pgTable("labels", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(), // Hex color (e.g., #ff0000)
  description: varchar("description", { length: 255 }),
}, (table) => ({
  // Unique constraint for project + name
  projectNameIdx: unique("labels_project_name_idx").on(table.projectId, table.name),
  // Index for project labels listing
  projectIdx: index("labels_project_idx").on(table.projectId),
}));

// Type inference - internal only, use types from types.ts instead
type Label = typeof labels.$inferSelect;
type NewLabel = typeof labels.$inferInsert;
