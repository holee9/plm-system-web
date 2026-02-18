/**
 * Drizzle Adapter for Auth.js v5
 *
 * This adapter connects Auth.js with the Drizzle ORM database schema.
 * It provides the database operations needed for Auth.js to manage
 * users, accounts, sessions, and verification tokens.
 *
 * @see https://authjs.dev/reference/adapter/drizzle
 */

import type { Adapter } from "next-auth/adapters";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users, accounts, sessions, verificationTokens } from "@/server/db/schema";

/**
 * Drizzle adapter implementation for Auth.js v5
 *
 * This adapter maps Auth.js operations to Drizzle ORM queries.
 * It supports:
 * - User management (create, get, update, delete)
 * - Account management (OAuth providers)
 * - Session management (database-backed sessions)
 * - Verification tokens (email verification, password reset)
 */
export function DrizzleAdapter(): Adapter {
  return {
    // User operations
    async createUser(user) {
      const newUser = await db
        .insert(users)
        .values({
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
        })
        .returning()
        .then((res) => res[0]);

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        image: newUser.image,
        emailVerified: newUser.emailVerified,
      };
    },

    async getUser(id) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .then((res) => res[0]);

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      };
    },

    async getUserByEmail(email) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .then((res) => res[0]);

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        )
        .leftJoin(users, eq(accounts.userId, users.id))
        .then((res) => res[0]);

      if (!account || !account.user) return null;

      return {
        id: account.user.id,
        email: account.user.email,
        name: account.user.name,
        image: account.user.image,
        emailVerified: account.user.emailVerified,
      };
    },

    async updateUser({ user }) {
      const updatedUser = await db
        .update(users)
        .set({
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
        })
        .where(eq(users.id, user.id!))
        .returning()
        .then((res) => res[0]);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
      };
    },

    async deleteUser(userId) {
      await db.delete(users).where(eq(users.id, userId));
    },

    // Account operations
    async linkAccount(account) {
      await db.insert(accounts).values({
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        );
    },

    // Session operations
    async createSession(session) {
      await db.insert(sessions).values({
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      });
    },

    async getSessionAndUser(sessionToken) {
      const sessionAndUser = await db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .innerJoin(users, eq(sessions.userId, users.id))
        .then((res) => res[0]);

      if (!sessionAndUser) return null;

      const { session, user } = sessionAndUser;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
        },
      };
    },

    async updateSession({ sessionToken, expires, userId }) {
      await db
        .update(sessions)
        .set({ expires, userId })
        .where(eq(sessions.sessionToken, sessionToken));
    },

    async deleteSession(sessionToken) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    // Verification token operations
    async createVerificationToken(token) {
      await db.insert(verificationTokens).values({
        identifier: token.identifier,
        token: token.token,
        expires: token.expires,
      });
    },

    async useVerificationToken({ identifier, token }) {
      const deletedToken = await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
        .returning()
        .then((res) => res[0]);

      if (!deletedToken) return null;

      return { identifier: deletedToken.identifier, token: deletedToken.token };
    },
  };
}
