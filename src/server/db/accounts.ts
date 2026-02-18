import { pgTable, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Accounts table for Auth.js v5 adapter
 *
 * This table stores OAuth provider account information and is required by
 * the Auth.js Drizzle adapter. Each account represents a connection between
 * a user and an authentication provider (email, GitHub, Google, etc.)
 *
 * @see https://authjs.dev/reference/core/adapters#account
 */
export const accounts = pgTable("accounts", {
  // Primary key
  id: uuid("id").defaultRandom().primaryKey(),

  // Foreign key to users table
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Account type and provider
  type: text("type").notNull(), // "email" | "oauth" | "oidc"
  provider: text("provider").notNull(), // "credentials" | "github" | "google"
  providerAccountId: text("provider_account_id").notNull(),

  // OAuth tokens
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"), // Unix timestamp (seconds)
  token_type: text("token_type"), // "bearer" | "mac"
  scope: text("scope"), // granted scopes
  id_token: text("id_token"), // OpenID Connect ID token

  // Session state for OAuth providers
  session_state: text("session_state"),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
