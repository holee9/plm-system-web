// Authentication router - Public procedures for auth operations
// Handles: register, login, logout, refresh, verifyEmail, requestPasswordReset, resetPassword

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, or, and, lt, desc, asc, gt } from "drizzle-orm";
import { publicProcedure, router } from "../index";
import {
  users,
  sessions,
  authEvents,
  roles,
  emailVerificationTokens,
  passwordResetTokens,
} from "../../db/schema";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken as hashTokenUtil,
  generateTokenId,
} from "../../utils/jwt";
import type { Context } from "../index";

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
    await db.insert(authEvents).values({
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
   * Register a new user account
   * Creates user with PENDING status and sends verification email
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
          message: "이미 이메일이 존재합니다",
        });
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordValidation.errors.join(", "),
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate email verification token
      const verificationToken = generateTokenId();
      const verificationTokenHash = await hashToken(verificationToken);
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          email,
          name,
          passwordHash,
          status: "PENDING",
          emailVerified: false,
        })
        .returning();

      const user = newUser[0];

      // Store email verification token
      await db.insert(emailVerificationTokens).values({
        userId: user.id,
        tokenHash: verificationTokenHash,
        email: user.email,
        expiresAt: verificationExpiresAt,
      });

      // Log registration event
      await logAuthEvent(db, "register", user.id, ctx);

      // TODO: Send verification email with token
      // For now, just return the token for testing
      // In production, this would be sent via email service

      return {
        success: true,
        message: "회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.",
        userId: user.id,
        // Only include token in development for testing
        ...(process.env.NODE_ENV === "development" && { verificationToken }),
      };
    }),

  /**
   * Login with email and password
   * Returns access and refresh tokens, creates session
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const db = ctx.db;

      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const user = userResult[0];

      if (!user) {
        // Don't reveal if user exists - generic error message
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "이메일 또는 비밀번호가 올바르지 않습니다",
        });
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "계정이 잠겨 있습니다. 나중에 다시 시도해주세요.",
        });
      }

      // Check account status
      if (user.status !== "ACTIVE") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `계정이 ${user.status.toLowerCase()} 상태입니다. 고객센터에 문의해주세요.`,
        });
      }

      // Verify password
      const isPasswordValid = user.passwordHash
        ? await verifyPassword(password, user.passwordHash)
        : false;

      if (!isPasswordValid) {
        // Increment failed login attempts
        const failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

        if (failedLoginAttempts >= 5) {
          // Lock account for 15 minutes
          const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          await db
            .update(users)
            .set({
              failedLoginAttempts,
              lockedUntil: lockUntil,
            })
            .where(eq(users.id, user.id));

          await logAuthEvent(db, "account_locked", user.id, ctx);

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "로그인 시도가 너무 많습니다. 15분간 계정이 잠깁니다.",
          });
        }

        await db
          .update(users)
          .set({ failedLoginAttempts })
          .where(eq(users.id, user.id));

        await logAuthEvent(db, "failed_login", user.id, ctx);

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "이메일 또는 비밀번호가 올바르지 않습니다",
        });
      }

      // Get user roles - simplified for now, will return empty array
      const userRoles: string[] = [];

      // Reset failed login attempts
      await db.update(users).set({ failedLoginAttempts: 0 }).where(eq(users.id, user.id));

      // Generate tokens
      const accessToken = await generateAccessToken(user.id.toString(), user.email, userRoles);
      const refreshTokenId = generateTokenId();
      const refreshToken = await generateRefreshToken(user.id.toString(), refreshTokenId);
      const refreshTokenHash = await hashToken(refreshToken);

      // Create session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await db.insert(sessions).values({
        userId: user.id,
        refreshTokenHash,
        expiresAt,
        userAgent: getUserAgent(ctx),
        ipAddress: getClientIp(ctx),
      });

      // Enforce session limit (max 5 sessions)
      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, user.id))
        .orderBy(asc(sessions.createdAt));

      if (userSessions.length > 5) {
        // Revoke oldest session
        const oldestSession = userSessions[0];
        await db.delete(sessions).where(eq(sessions.id, oldestSession.id));
      }

      // Log login event
      await logAuthEvent(db, "login", user.id, ctx);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: userRoles,
        },
      };
    }),

  /**
   * Logout current user
   * Revokes refresh token
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const db = ctx.db;
    const refreshToken = ctx.req?.cookies?.get("refresh_token")?.value;

    if (refreshToken && db) {
      const refreshTokenHash = await hashToken(refreshToken);
      await db.delete(sessions).where(eq(sessions.refreshTokenHash, refreshTokenHash));
    }

    // TODO: Log logout event if we had user info

    return {
      success: true,
      message: "로그아웃되었습니다",
    };
  }),

  /**
   * Refresh access token using refresh token
   * Rotates refresh token for security
   */
  refresh: publicProcedure.mutation(async ({ ctx }) => {
    const db = ctx.db;
    const refreshToken = ctx.req?.cookies?.get("refresh_token")?.value;

    if (!refreshToken || !db) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "리프레시 토큰이 필요합니다",
      });
    }

    // Verify refresh token
    let payload;
    try {
      payload = await verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "유효하지 않거나 만료된 리프레시 토큰입니다",
      });
    }

    // Find session
    const refreshTokenHash = await hashToken(refreshToken);
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshTokenHash, refreshTokenHash))
      .limit(1);

    const session = sessionResult[0];

    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "유효하지 않은 세션입니다",
      });
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "세션이 만료되었습니다",
      });
    }

    // Get user
    const userResult = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    const user = userResult[0];

    if (!user || user.status !== "ACTIVE") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "사용자를 찾을 수 없거나 비활성 상태입니다",
      });
    }

    // Get user roles
    const userRoles: string[] = []; // TODO: Fetch from DB when roles are implemented

    // Generate new tokens
    const accessToken = await generateAccessToken(user.id.toString(), user.email, userRoles);
    const newRefreshTokenId = generateTokenId();
    const newRefreshToken = await generateRefreshToken(user.id.toString(), newRefreshTokenId);
    const newRefreshTokenHash = await hashToken(newRefreshToken);

    // Update session with new refresh token
    await db
      .update(sessions)
      .set({
        refreshTokenHash: newRefreshTokenHash,
      })
      .where(eq(sessions.id, session.id));

    // Log token refresh event
    await logAuthEvent(db, "token_refresh", user.id, ctx);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }),

  /**
   * Verify email using verification token
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
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.tokenHash, tokenHash))
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
        await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, verificationToken.id));
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

      // Update user status to ACTIVE and mark email as verified
      await db
        .update(users)
        .set({
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Delete the verification token
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, verificationToken.id));

      // Log email verification event
      await logAuthEvent(db, "email_verified", user.id, ctx);

      return {
        success: true,
        message: "이메일이 성공적으로 인증되었습니다.",
      };
    }),

  /**
   * Request password reset
   * Sends password reset email
   */
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email("올바른 이메일 주소를 입력해주세요"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email } = input;
      const db = ctx.db;

      // Find user
      const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const user = userResult[0];

      // Always return success to prevent email enumeration
      // But only send email if user exists
      if (user) {
        const resetToken = generateTokenId();
        const resetTokenHash = await hashToken(resetToken);
        const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store reset token in database
        await db.insert(passwordResetTokens).values({
          userId: user.id,
          tokenHash: resetTokenHash,
          expiresAt: resetExpiresAt,
        });

        // TODO: Send password reset email with token
        // For now, just return the token for testing in development
        if (process.env.NODE_ENV === "development") {
          console.log("Password reset token:", resetToken);
        }

        await logAuthEvent(db, "password_reset", user.id, ctx);
      }

      return {
        success: true,
        message: "해당 이메일로 계정이 존재하면 비밀번호 재설정 링크가 발송되었습니다.",
        // Only include token in development for testing
        ...(process.env.NODE_ENV === "development" && user && { resetToken: generateTokenId() }),
      };
    }),

  /**
   * Reset password using reset token
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
      const db = ctx.db;

      // Validate password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordValidation.errors.join(", "),
        });
      }

      // Hash the token to look up in database
      const tokenHash = await hashToken(token);

      // Find the reset token
      const tokenResult = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.tokenHash, tokenHash))
        .limit(1);

      const resetToken = tokenResult[0];

      if (!resetToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "유효하지 않은 재설정 토큰입니다",
        });
      }

      // Check if token is already used
      if (resetToken.used) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "이미 사용된 재설정 토큰입니다. 다시 요청해주세요.",
        });
      }

      // Check if token is expired
      if (resetToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "재설정 토큰이 만료되었습니다. 다시 요청해주세요.",
        });
      }

      // Get the user
      const userResult = await db.select().from(users).where(eq(users.id, resetToken.userId)).limit(1);
      const user = userResult[0];

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "사용자를 찾을 수 없습니다",
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update user password
      await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Mark reset token as used
      await db
        .update(passwordResetTokens)
        .set({
          used: true,
          usedAt: new Date(),
        })
        .where(eq(passwordResetTokens.id, resetToken.id));

      // Delete all user sessions (force re-login on all devices)
      await db.delete(sessions).where(eq(sessions.userId, user.id));

      // Log password change event
      await logAuthEvent(db, "password_changed", user.id, ctx);

      return {
        success: true,
        message: "비밀번호가 재설정되었습니다. 다시 로그인해주세요.",
      };
    }),
});
