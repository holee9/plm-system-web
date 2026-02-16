// Issue-Labels junction table schema
import { pgTable, uuid, unique, index } from "drizzle-orm/pg-core";
import { issues } from "./issues";
import { labels } from "./labels";

// Issue-Labels junction table (many-to-many)
export const issueLabels = pgTable("issue_labels", {
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  labelId: uuid("label_id")
    .notNull()
    .references(() => labels.id, { onDelete: "cascade" }),
}, (table) => ({
  // Primary key
  pk: unique("issue_labels_pk").on(table.issueId, table.labelId),
  // Index for fetching labels by issue
  issueIdx: index("issue_labels_issue_idx").on(table.issueId),
  // Index for fetching issues by label
  labelIdx: index("issue_labels_label_idx").on(table.labelId),
}));

// Type inference - internal only, use types from types.ts instead
type IssueLabel = typeof issueLabels.$inferSelect;
type NewIssueLabel = typeof issueLabels.$inferInsert;
