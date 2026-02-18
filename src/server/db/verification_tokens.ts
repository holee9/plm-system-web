import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Verification tokens table for Auth.js v5 adapter
 *
 * This table stores temporary tokens used for email verification, password reset,
 * and other verification flows. Tokens are single-use and have expiration times.
 *
 * @see https://authjs.dev/reference/core/adapters#verification-token
 */
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    // Composite primary key: identifier + token
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    pk: { primaryKey: true, columns: [table.identifier, table.token] },
  })
);

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
