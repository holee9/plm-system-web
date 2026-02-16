import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { parts } from "./parts";
import { users } from "./users";

// Revisions table - stores all part revisions (immutable)
export const revisions = pgTable("revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  partId: uuid("part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" }),
  revisionCode: varchar("revision_code", { length: 10 }).notNull(), // A, B, C, ..., AA, AB, ...
  description: text("description"), // Change reason/description
  changes: jsonb("changes"), // Detailed change record (before/after values)
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: revision code must be unique within part
  uniquePartRevision: sql`UNIQUE(table.part_id, table.revision_code)`,
  // Index for part revision lookups
  partIdx: sql`CREATE INDEX IF NOT EXISTS revisions_part_id_idx ON revisions(part_id)`,
  // Index for chronological ordering
  createdAtIdx: sql`CREATE INDEX IF NOT EXISTS revisions_created_at_idx ON revisions(created_at)`,
}));

// Type inference
export type Revision = typeof revisions.$inferSelect;
export type NewRevision = typeof revisions.$inferInsert;
