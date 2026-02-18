// Notification preferences table schema
import { pgTable, pgEnum, uuid, boolean, text, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { users } from "../../../server/db/users";

// Notification channel enum
export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app",
  "email",
  "push",
]);

// Notification category enum
export const notificationCategoryEnum = pgEnum("notification_category", [
  "issues",
  "projects",
  "plm",
]);

// Notification frequency enum
export const notificationFrequencyEnum = pgEnum("notification_frequency", [
  "immediate",
  "hourly",
  "daily",
  "weekly",
]);

// Notification preferences table
// User-specific notification settings by channel, category, and optional project
export const notificationPreferences = pgTable("notification_preferences", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channel: notificationChannelEnum("channel").notNull(),
  category: notificationCategoryEnum("category").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  frequency: notificationFrequencyEnum("frequency").notNull().default("immediate"),
  projectId: text("project_id").notNull().default("global"), // "global" for user-level defaults, specific project ID for overrides
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Composite primary key: userId + channel + category + projectId
  pk: primaryKey({
    columns: [table.userId, table.channel, table.category, table.projectId],
  }),
  // Index for user lookups
  userIdIdx: index("notification_preferences_user_id_idx").on(table.userId),
  // Index for project-specific lookups
  projectIdIdx: index("notification_preferences_project_id_idx").on(table.projectId),
}));

// Type inference
type DbNotificationPreference = typeof notificationPreferences.$inferSelect;
type NewDbNotificationPreference = typeof notificationPreferences.$inferInsert;

// Export types
export type {
  DbNotificationPreference as NotificationPreferenceSchema,
  NewDbNotificationPreference as NewNotificationPreferenceSchema,
};
