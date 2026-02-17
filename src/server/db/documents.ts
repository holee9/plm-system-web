/**
 * Documents and Files database schema
 * Defines tables for file uploads with version management
 */
import { pgTable, uuid, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

// ============================================================================
// Documents Table
// ============================================================================

/**
 * Documents table - stores file metadata with version support
 */
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  resourceId: uuid("resource_id").notNull(), // Generic resource ID (issue, part, change order, etc.)
  resourceType: varchar("resource_type", { length: 50 }).notNull(), // e.g., "issue", "part", "change_order"
  originalFileName: varchar("original_file_name", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(), // Stored filename
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(), // Size in bytes
  storagePath: varchar("storage_path", { length: 1000 }).notNull(), // Path to stored file
  version: integer("version").default(1).notNull(), // Version number for this resource
  isLatest: boolean("is_latest").default(true).notNull(), // Whether this is the latest version
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  description: text("description"), // Optional file description
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Index for resource lookups
  resourceIdx: sql`CREATE INDEX IF NOT EXISTS documents_resource_idx ON documents(resource_id, resource_type)`,
  // Index for finding latest versions
  latestIdx: sql`CREATE INDEX IF NOT EXISTS documents_is_latest_idx ON documents(is_latest)`,
  // Index for uploader lookups
  uploaderIdx: sql`CREATE INDEX IF NOT EXISTS documents_uploaded_by_idx ON documents(uploaded_by)`,
}));

// ============================================================================
// Type Inference
// ============================================================================

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
