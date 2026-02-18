/**
 * Auth.js v5 Instance
 *
 * This is the main Auth.js instance that exports:
 * - auth: The server-side auth function
 * - handlers: For API route handlers
 * - signIn, signOut, signOut: Helper functions
 *
 * @see https://authjs.dev/reference/nextjs
 */

import { NextAuth } from "next-auth";
import { DrizzleAdapter } from "./adapter";
import { authConfig } from "./config";
import { CredentialsProvider } from "./credentials-provider";

/**
 * Auth.js v5 configuration with adapter and providers
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(),
  ...authConfig,
  providers: [
    CredentialsProvider(),
    // OAuth providers will be added here in future phases
    // GitHubProvider({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID!,
    //   clientSecret: process.env.GOOGLE_SECRET!,
    // }),
  ],
});

/**
 * Export the auth handler for API routes
 * This is used in src/app/api/auth/[...nextauth]/route.ts
 */
export const { GET, POST } = handlers;
