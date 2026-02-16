import { pgTable, uuid, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { parts } from "./parts";

// BOM items table - stores parent-child relationships
export const bomItems = pgTable("bom_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentPartId: uuid("parent_part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "cascade" }),
  childPartId: uuid("child_part_id")
    .notNull()
    .references(() => parts.id, { onDelete: "restrict" }),
  quantity: varchar("quantity", { length: 10 }).notNull().default("1"),
  unit: varchar("unit", { length: 20 }).notNull().default("EA"),
  position: integer("position").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: same child cannot appear twice under same parent
  uniqueParentChild: sql`UNIQUE(table.parent_part_id, table.child_part_id)`,
  // Check constraint: parent cannot be its own child
  noSelfReference: sql`CHECK (table.parent_part_id != table.child_part_id)`,
  // Index for parent lookups (BOM tree queries)
  parentIdx: sql`CREATE INDEX IF NOT EXISTS bom_items_parent_part_id_idx ON bom_items(parent_part_id)`,
  // Index for child lookups (where-used queries)
  childIdx: sql`CREATE INDEX IF NOT EXISTS bom_items_child_part_id_idx ON bom_items(child_part_id)`,
  // Index for position ordering
  positionIdx: sql`CREATE INDEX IF NOT EXISTS bom_items_position_idx ON bom_items(position)`,
}));

// Type inference
export type BomItem = typeof bomItems.$inferSelect;
export type NewBomItem = typeof bomItems.$inferInsert;
