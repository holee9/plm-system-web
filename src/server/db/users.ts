import { pgTable, text, serial, timestamp, boolean, pgEnum, integer } from "drizzle-orm/pg-core";

// User status enum
export const userStatusEnum = pgEnum("user_status", ["PENDING", "ACTIVE", "LOCKED", "DEACTIVATED"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  // Auth fields
  passwordHash: text("password_hash"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
  status: userStatusEnum("status").default("PENDING").notNull(),
  // Security fields
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  // Profile fields
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
