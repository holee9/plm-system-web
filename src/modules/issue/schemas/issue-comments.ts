// Issue comments table schema
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { issues } from "./issues";
import { users } from "../../../server/db/users";

// Issue comments table
export const issueComments = pgTable("issue_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Index for fetching comments by issue
  issueIdx: index("issue_comments_issue_idx").on(table.issueId),
  // Index for fetching comments by author
  authorIdx: index("issue_comments_author_idx").on(table.authorId),
}));

// Type inference - internal only, use types from types.ts instead
type IssueComment = typeof issueComments.$inferSelect;
type NewIssueComment = typeof issueComments.$inferInsert;
