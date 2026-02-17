// Notification recipients table schema
import { pgTable, uuid, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { users } from "../../../server/db/users";
import { notifications } from "./notifications";

// Notification recipients table
export const notificationRecipients = pgTable("notification_recipients", {
  id: uuid("id").defaultRandom().primaryKey(),
  notificationId: uuid("notification_id")
    .notNull()
    .references(() => notifications.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
}, (table) => ({
  // Composite unique constraint: one recipient per notification per user
  notificationUserIdx: index("notification_recipients_notification_user_idx")
    .on(table.notificationId, table.userId),
  // Index for user notifications list
  userIdx: index("notification_recipients_user_idx").on(table.userId),
  // Index for read status filtering
  isReadIdx: index("notification_recipients_is_read_idx").on(table.isRead),
}));

// Type inference - internal only
type DbNotificationRecipient = typeof notificationRecipients.$inferSelect;
type NewDbNotificationRecipient = typeof notificationRecipients.$inferInsert;

// Export types with different names to avoid conflicts
export type { DbNotificationRecipient as NotificationRecipientSchema, NewDbNotificationRecipient as NewNotificationRecipientSchema };
