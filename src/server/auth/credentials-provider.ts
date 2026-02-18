/**
 * Credentials Provider for Auth.js v5
 *
 * This provider implements email/password authentication using the
 * credentials authentication flow in Auth.js v5.
 *
 * Features:
 * - Email/password authentication
 * - Password verification with bcrypt
 * - Account lockout logic (after failed attempts)
 * - Failed login attempt logging
 * - User status validation (ACTIVE only)
 * - Rate limiting (AC-010: 10 attempts per minute)
 *
 * @see https://authjs.dev/reference/core/providers#credentials
 */

import type { User } from "next-auth";
import type { CredentialsConfig } from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users, auth_events } from "@/server/db/schema";
import { verifyPassword } from "@/server/utils/password";
import { authRateLimiter } from "@/server/middleware/rate-limit";

/**
 * Credentials Provider Configuration
 *
 * Implements the authorize function that:
 * 1. Validates email/password input
 * 2. Finds user by email
 * 3. Verifies password
 * 4. Checks account status and lockout
 * 5. Logs failed attempts
 * 6. Returns user object on success
 */
export function CredentialsProvider(): CredentialsConfig<User> {
  return {
    id: "credentials",
    name: "Credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "user@example.com",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },
    async authorize(credentials): Promise<User | null> {
      // Validate credentials presence
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const { email, password } = credentials;

      try {
        // AC-010: Check rate limit BEFORE database query (NFR-002)
        // Use email as identifier to limit login attempts per email
        const rateLimitResult = await authRateLimiter.checkLimit(email);

        if (!rateLimitResult.allowed) {
          // Rate limit exceeded - log event and return null
          await logAuthEvent(email, "LOGIN_FAILED", `RATE_LIMITED: Reset at ${rateLimitResult.resetAt.toISOString()}`);
          return null;
        }

        // Find user by email
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .then((res) => res[0]);

        if (!user) {
          // User not found - log failed attempt for security audit
          await logAuthEvent(email, "LOGIN_FAILED", "USER_NOT_FOUND");
          return null;
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await logAuthEvent(user.id, "LOGIN_FAILED", "ACCOUNT_LOCKED");
          return null;
        }

        // Verify password
        if (!user.passwordHash) {
          // User exists but no password (OAuth-only user)
          await logAuthEvent(user.id, "LOGIN_FAILED", "NO_PASSWORD");
          return null;
        }

        const passwordValid = await verifyPassword(password, user.passwordHash);

        if (!passwordValid) {
          // Increment failed login attempts
          const failedAttempts = user.failedLoginAttempts + 1;
          const maxAttempts = 5;

          if (failedAttempts >= maxAttempts) {
            // Lock account for 30 minutes
            const lockUntil = new Date(Date.now() + 30 * 60 * 1000);

            await db
              .update(users)
              .set({
                failedLoginAttempts: failedAttempts,
                lockedUntil: lockUntil,
                status: "LOCKED",
              })
              .where(eq(users.id, user.id));

            await logAuthEvent(user.id, "ACCOUNT_LOCKED", `Failed attempts: ${failedAttempts}`);
          } else {
            // Just increment failed attempts
            await db
              .update(users)
              .set({ failedLoginAttempts: failedAttempts })
              .where(eq(users.id, user.id));

            await logAuthEvent(user.id, "LOGIN_FAILED", `Attempt ${failedAttempts}/${maxAttempts}`);
          }

          return null;
        }

        // Check user status
        if (user.status !== "ACTIVE") {
          await logAuthEvent(user.id, "LOGIN_FAILED", `INVALID_STATUS: ${user.status}`);
          return null;
        }

        // Reset failed login attempts on successful login
        await db
          .update(users)
          .set({
            failedLoginAttempts: 0,
            lockedUntil: null,
          })
          .where(eq(users.id, user.id));

        // Log successful login
        await logAuthEvent(user.id, "LOGIN_SUCCESS");

        // Return user object (required by Auth.js)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
        };
      } catch (error) {
        // Log unexpected errors
        console.error("Credentials provider error:", error);
        await logAuthEvent(email, "LOGIN_FAILED", "SYSTEM_ERROR");
        return null;
      }
    },
  };
}

/**
 * Log authentication event
 *
 * This function logs authentication events for security audit and monitoring.
 * It includes successful logins, failed attempts, account lockouts, etc.
 */
async function logAuthEvent(
  userIdentifer: string,
  eventType: string,
  metadata?: string
): Promise<void> {
  try {
    await db.insert(auth_events).values({
      userId: userIdentifer,
      eventType,
      metadata: metadata || null,
      ipAddress: null, // Will be set from request context in production
      userAgent: null, // Will be set from request context in production
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break auth flow
    console.error("Failed to log auth event:", error);
  }
}
