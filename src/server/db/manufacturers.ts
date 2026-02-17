/**
 * Manufacturers and Suppliers database schema
 * Defines tables for part manufacturers and suppliers with many-to-many relationships
 */
import { pgTable, uuid, varchar, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { parts } from "./parts";

// ============================================================================
// Manufacturers Table
// ============================================================================

/**
 * Manufacturers table - entities that produce/manufacturer parts
 */
export const manufacturers = pgTable("manufacturers", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Index for code lookups
  codeIdx: sql`CREATE INDEX IF NOT EXISTS manufacturers_code_idx ON manufacturers(code)`,
  // Index for name searches
  nameIdx: sql`CREATE INDEX IF NOT EXISTS manufacturers_name_idx ON manufacturers(name)`,
  // Index for created_at sorting
  createdAtIdx: sql`CREATE INDEX IF NOT EXISTS manufacturers_created_at_idx ON manufacturers(created_at)`,
}));

// ============================================================================
// Suppliers Table
// ============================================================================

/**
 * Suppliers table - entities that supply/provide parts
 */
export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  address: text("address"),
  description: text("description"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Index for code lookups
  codeIdx: sql`CREATE INDEX IF NOT EXISTS suppliers_code_idx ON suppliers(code)`,
  // Index for name searches
  nameIdx: sql`CREATE INDEX IF NOT EXISTS suppliers_name_idx ON suppliers(name)`,
  // Index for email lookups
  emailIdx: sql`CREATE INDEX IF NOT EXISTS suppliers_contact_email_idx ON suppliers(contact_email)`,
  // Index for created_at sorting
  createdAtIdx: sql`CREATE INDEX IF NOT EXISTS suppliers_created_at_idx ON suppliers(created_at)`,
}));

// ============================================================================
// Parts-Manufacturers Junction Table (Many-to-Many)
// ============================================================================

/**
 * Parts to Manufacturers junction table
 * A part can have multiple manufacturers, a manufacturer can produce multiple parts
 */
export const partsManufacturers = pgTable("parts_manufacturers", {
  partId: uuid("part_id").notNull().references(() => parts.id, { onDelete: "cascade" }),
  manufacturerId: uuid("manufacturer_id").notNull().references(() => manufacturers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Composite primary key
  pk: primaryKey({ columns: [table.partId, table.manufacturerId] }),
  // Index for part lookups
  partIdx: sql`CREATE INDEX IF NOT EXISTS parts_manufacturers_part_id_idx ON parts_manufacturers(part_id)`,
  // Index for manufacturer lookups
  manufacturerIdx: sql`CREATE INDEX IF NOT EXISTS parts_manufacturers_manufacturer_id_idx ON parts_manufacturers(manufacturer_id)`,
}));

// ============================================================================
// Parts-Suppliers Junction Table (Many-to-Many)
// ============================================================================

/**
 * Parts to Suppliers junction table
 * A part can have multiple suppliers, a supplier can provide multiple parts
 */
export const partsSuppliers = pgTable("parts_suppliers", {
  partId: uuid("part_id").notNull().references(() => parts.id, { onDelete: "cascade" }),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Composite primary key
  pk: primaryKey({ columns: [table.partId, table.supplierId] }),
  // Index for part lookups
  partIdx: sql`CREATE INDEX IF NOT EXISTS parts_suppliers_part_id_idx ON parts_suppliers(part_id)`,
  // Index for supplier lookups
  supplierIdx: sql`CREATE INDEX IF NOT EXISTS parts_suppliers_supplier_id_idx ON parts_suppliers(supplier_id)`,
}));

// ============================================================================
// Type Inference
// ============================================================================

export type Manufacturer = typeof manufacturers.$inferSelect;
export type NewManufacturer = typeof manufacturers.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;

export type PartManufacturer = typeof partsManufacturers.$inferSelect;
export type NewPartManufacturer = typeof partsManufacturers.$inferInsert;

export type PartSupplier = typeof partsSuppliers.$inferSelect;
export type NewPartSupplier = typeof partsSuppliers.$inferInsert;
