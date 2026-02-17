// Notifications table schema
import { pgTable, uuid, varchar, text, timestamp, jsonb, index, pgEnum } from "drizzle-orm/pg-core";
import { users } from "../../../server/db/users";

// Notification type enum
export const notificationTypeEnum = pgEnum("notification_type", [
  "issue_assigned",
  "issue_mentioned",
  "issue_commented",
  "issue_status_changed",
  "project_member_added",
]);

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional data (e.g., issue ID, project ID)
  link: varchar("link", { length: 500 }), // Link URL
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Index for type filtering
  typeIdx: index("notifications_type_idx").on(table.type),
  // Index for created_at sorting (recent notifications)
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  // Index for created_by filtering
  createdByIdx: index("notifications_created_by_idx").on(table.createdBy),
}));

// Type inference - internal only
type Notification = typeof notifications.$inferSelect;
type NewNotification = typeof notifications.$inferInsert;

export { Notification, NewNotification };
