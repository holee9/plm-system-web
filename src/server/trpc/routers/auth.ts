// Authentication router - Public procedures for auth operations
// Handles: register (for credentials provider setup), verifyEmail, requestPasswordReset, resetPassword
//
// NOTE: login, logout, and refresh are now handled by Auth.js v5
// - login: via credentials provider (signIn function)
// - logout: via signOut function
// - refresh: automatic via Auth.js session management

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../index";
import {
  users,
  auth_events,
  email_verification_tokens,
  password_reset_tokens,
} from "../../db/schema";
import { hashPassword, validatePasswordStrength } from "../../utils/password";
import {
  hashToken as hashTokenUtil,
  generateTokenId,
} from "../../utils/jwt";
import type { Context } from "../index";
import { PasswordResetService } from "@/server/auth/password-reset";
import { passwordResetRateLimiter } from "@/server/middleware/rate-limit";

// Helper function to hash tokens for database storage
async function hashToken(token: string): Promise<string> {
  return hashTokenUtil(token);
}

// Helper function to get client IP address
function getClientIp(ctx: Context): string {
  return (
    (ctx.req?.headers?.get("x-forwarded-for")?.split(",")[0].trim() ||
      ctx.req?.headers?.get("x-real-ip") ||
      "unknown") as string
  );
}

// Helper function to get user agent
function getUserAgent(ctx: Context): string {
  return (ctx.req?.headers?.get("user-agent") || "unknown") as string;
}

// Helper function to log auth events
async function logAuthEvent(
  db: Context["db"],
  eventType: any,
  userId: string | null,
  ctx: Context
): Promise<void> {
  try {
    await db.insert(auth_events).values({
      userId,
      eventType,
      ipAddress: getClientIp(ctx),
      userAgent: getUserAgent(ctx),
      metadata: {},
    });
  } catch (error) {
    // Log errors but don't throw - auth logging shouldn't break auth flow
    console.error("Failed to log auth event:", error);
  }
}

export const authRouter = router({
  /**
   * Register a new user account for credentials provider
   * Creates user with ACTIVE status (MVP: email verification optional)
   *
   * After successful registration, client should call signIn() with credentials
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("올바른 이메일 주소를 입력해주세요"),
        password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
        name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다").max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password, name } = input;
      const db = ctx.db;

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "이미 등록된 이메일입니다",
        });
      }

      // Validate password strength (NFR-004)
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordValidation.errors.join(", "),
        });
      }

      // Hash password for credentials provider
      const passwordHash = await hashPassword(password);

      // Create user with ACTIVE status (MVP: email verification skipped)
      const newUser = await db
        .insert(users)
        .values({
          email,
          name,
          passwordHash,
          status: "ACTIVE",
          emailVerified: null, // Using timestamp for Auth.js v5 (null = not verified)
        })
        .returning();

      const user = newUser[0];

      // Log registration event
      await logAuthEvent(db, "USER_REGISTERED", user.id, ctx);

      return {
        success: true,
        message: "회원가입이 완료되었습니다.",
        userId: user.id,
      };
    }),

  /**
   * Verify email using verification token
   * Updates emailVerified timestamp for Auth.js v5
   */
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "토큰을 입력해주세요"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { token } = input;
      const db = ctx.db;

      // Hash the token to look up in database
      const tokenHash = await hashToken(token);

      // Find the verification token
      const tokenResult = await db
        .select()
        .from(email_verification_tokens)
        .where(eq(email_verification_tokens.tokenHash, tokenHash))
        .limit(1);

      const verificationToken = tokenResult[0];

      if (!verificationToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "유효하지 않은 인증 토큰입니다",
        });
      }

      // Check if token is expired
      if (verificationToken.expiresAt < new Date()) {
        // Delete expired token
        await db.delete(email_verification_tokens).where(
          eq(email_verification_tokens.id, verificationToken.id)
        );
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "인증 토큰이 만료되었습니다. 다시 요청해주세요.",
        });
      }

      // Get the user
      const userResult = await db.select().from(users).where(eq(users.id, verificationToken.userId)).limit(1);
      const user = userResult[0];

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "사용자를 찾을 수 없습니다",
        });
      }

      // Update user emailVerified to current timestamp (Auth.js v5 format)
      await db
        .update(users)
        .set({
          emailVerified: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Delete the verification token
      await db.delete(email_verification_tokens).where(
        eq(email_verification_tokens.id, verificationToken.id)
      );

      // Log email verification event
      await logAuthEvent(db, "EMAIL_VERIFIED", user.id, ctx);

      return {
        success: true,
        message: "이메일이 성공적으로 인증되었습니다.",
      };
    }),

  /**
   * Request password reset
   * Sends password reset email (or logs token in development)
   * Uses PasswordResetService for business logic
   */
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email("올바른 이메일 주소를 입력해주세요"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email } = input;

      // Check rate limit for password reset requests
      const rateLimitResult = await passwordResetRateLimiter.checkLimit(email);
      if (!rateLimitResult.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `너무 많은 재설정 요청을 보내셨습니다. ${Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 60000)}분 후에 다시 시도해주세요.`,
        });
      }

      // Use PasswordResetService for business logic
      const passwordResetService = new PasswordResetService(ctx.db);
      const result = await passwordResetService.requestPasswordReset(email, {
        ipAddress: getClientIp(ctx),
        userAgent: getUserAgent(ctx),
      });

      return result;
    }),

  /**
   * Reset password using reset token
   * Uses PasswordResetService for business logic
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "토큰을 입력해주세요"),
        newPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { token, newPassword } = input;

      // Use PasswordResetService for business logic
      const passwordResetService = new PasswordResetService(ctx.db);
      const result = await passwordResetService.resetPassword(token, newPassword, {
        ipAddress: getClientIp(ctx),
        userAgent: getUserAgent(ctx),
      });

      if (!result.success) {
        throw new TRPCError({
          code: result.error?.includes("만료") || result.error?.includes("유효하지 않")
            ? "UNAUTHORIZED"
            : "BAD_REQUEST",
          message: result.error || "비밀번호 재설정에 실패했습니다",
        });
      }

      return result;
    }),
});
