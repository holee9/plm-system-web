import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Sessions table for Auth.js v5 adapter
 *
 * This table stores user session information and is required by the
 * Auth.js Drizzle adapter. Each session represents an authenticated
 * user session with a unique session token.
 *
 * @see https://authjs.dev/reference/core/adapters#session
 */
export const sessions = pgTable("sessions", {
  // Primary key
  id: uuid("id").defaultRandom().primaryKey(),

  // Session token (required by Auth.js v5)
  sessionToken: text("session_token").notNull().unique(),

  // Foreign key to users table
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Expiration timestamp
  expires: timestamp("expires").notNull(),

  // Security fields (for session tracking and audit)
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
