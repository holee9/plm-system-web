// Issue Attachments table schema
import { pgTable, uuid, varchar, bigint, text, timestamp, index } from "drizzle-orm/pg-core";
import { issues } from "./issues";
import { users } from "../../../server/db/users";

// Issue attachments table
export const issueAttachments = pgTable("issue_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 500 }).notNull(), // UUID_prefix + original name
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(), // File size in bytes
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
}, (table) => ({
  // Index for issue lookups
  issueIdx: index("issue_attachments_issue_idx").on(table.issueId),
  // Index for uploader lookups
  uploadedByIdx: index("issue_attachments_uploaded_by_idx").on(table.uploadedBy),
}));

// Type inference - internal only, use types from types.ts instead
type IssueAttachment = typeof issueAttachments.$inferSelect;
type NewIssueAttachment = typeof issueAttachments.$inferInsert;
