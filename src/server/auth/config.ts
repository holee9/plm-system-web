/**
 * Auth.js v5 Configuration
 *
 * This file contains the configuration for NextAuth.js v5 with the
 * Drizzle adapter. It configures authentication providers, session
 * strategy, cookies, and security settings.
 *
 * Session Strategy: database (NOT jwt)
 * - Sessions are stored in the database for better security
 * - Allows server-side session invalidation
 * - Supports multiple concurrent sessions per user
 *
 * Cookie Settings:
 * - httpOnly: Prevents XSS attacks
 * - secure: HTTPS only in production
 * - sameSite: lax for better UX with CSRF protection
 *
 * @see https://authjs.dev/reference/core#authconfig
 */

import type { NextAuthConfig } from "next-auth";
import { CredentialsProvider } from "./credentials-provider";
import { getOAuthProviders } from "./oauth-providers";

export const authConfig: NextAuthConfig = {
  // Session strategy: database (NOT jwt)
  // This stores sessions in the database instead of JWT tokens
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days (NFR-005)
  },

  // Configure authentication providers
  providers: [
    CredentialsProvider(),
    // OAuth providers (GitHub, Google) - FR-009
    ...getOAuthProviders(),
  ],

  // Custom pages
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/register",
  },

  // Callbacks
  callbacks: {
    // Called after a successful sign in
    async signIn({ user, account }) {
      // Allow sign in for OAuth providers
      if (account?.provider !== "credentials") {
        // AC-013: OAuth users have emailVerified=true
        // This is set in the OAuth provider's profile callback
        return true;
      }

      // For credentials provider, check user status
      // This will be handled by the credentials provider's authorize function
      return true;
    },

    // Called when session is checked
    async session({ session, user }) {
      // Add user id to session
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;
        session.user.image = user.image;
      }
      return session;
    },

    // Called when JWT is created (not used with database strategy)
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },

  // Security settings
  // CSRF protection is enabled by default in Auth.js v5

  // Event handlers
  events: {},

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
};
