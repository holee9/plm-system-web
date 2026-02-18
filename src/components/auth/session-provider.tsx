"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

/**
 * Auth.js v5 Session Provider
 *
 * Wraps the application with NextAuth session context.
 * Place this at the root layout to enable session hooks (useSession, getSession).
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
