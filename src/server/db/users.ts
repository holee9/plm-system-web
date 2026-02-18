import { pgTable, text, uuid, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

// User status enum
export const userStatusEnum = pgEnum("user_status", ["PENDING", "ACTIVE", "LOCKED", "DEACTIVATED"]);

/**
 * Users table for Auth.js v5 adapter
 *
 * This table stores user account information and is required by the
 * Auth.js Drizzle adapter. Each user represents a unique account with
 * authentication credentials and profile information.
 *
 * @see https://authjs.dev/reference/core/adapters#user
 */
export const users = pgTable("users", {
  // Primary key
  id: uuid("id").defaultRandom().primaryKey(),

  // Auth fields (required by Auth.js v5)
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: timestamp("email_verified"), // Changed from boolean to timestamp for Auth.js v5

  // Credentials provider fields
  passwordHash: text("password_hash"),

  // User status and security
  status: userStatusEnum("status").default("PENDING").notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),

  // Profile fields
  image: text("image"),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
