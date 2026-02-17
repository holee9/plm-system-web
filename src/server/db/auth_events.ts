import { pgTable, text, uuid, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

// Auth event types enum
export const authEventTypeEnum = pgEnum("auth_event_type", [
  "login",
  "logout",
  "register",
  "password_reset",
  "email_verified",
  "account_locked",
  "account_unlocked",
  "password_changed",
  "session_revoked",
  "failed_login",
]);

// Auth events table for audit logging
export const authEvents = pgTable("auth_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: authEventTypeEnum("event_type").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuthEvent = typeof authEvents.$inferSelect;
export type NewAuthEvent = typeof authEvents.$inferInsert;
