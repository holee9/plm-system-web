// User router - Protected procedures for user management
// Handles: me, updateProfile, changePassword, sessions, revokeSession, revokeAllSessions

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../procedures";
import { users, sessions, authEvents } from "../../db/schema";
import { verifyPassword, hashPassword, validatePasswordStrength } from "../../utils/password";
import { hashToken as hashTokenUtil } from "../../utils/jwt";
import type { AuthenticatedContext } from "../middleware";

// Helper function to hash tokens (matching auth router)
async function hashToken(token: string): Promise<string> {
  return hashTokenUtil(token);
}

export const userRouter = router({
  /**
   * Get current user information
   * Requires authentication
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx as AuthenticatedContext;

    // Get fresh user data from database
    const userResult = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    const userData = userResult[0];

    if (!userData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "사용자를 찾을 수 없습니다",
      });
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      image: userData.image,
      status: userData.status,
      emailVerified: userData.emailVerified,
      roles: user.roles,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  }),

  /**
   * Update user profile
   * Requires authentication
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { name, image } = input;

      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (image !== undefined) updateData.image = image;
      updateData.updatedAt = new Date();

      // Update user
      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, user.id))
        .returning();

      return {
        success: true,
        message: "프로필이 업데이트되었습니다",
        user: {
          id: updatedUser[0].id,
          email: updatedUser[0].email,
          name: updatedUser[0].name,
          image: updatedUser[0].image,
        },
      };
    }),

  /**
   * Change password
   * Requires authentication and current password verification
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
        newPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { currentPassword, newPassword } = input;

      // Get user with password hash
      const userResult = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      const userData = userResult[0];

      if (!userData || !userData.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "이 계정의 비밀번호를 변경할 수 없습니다",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "현재 비밀번호가 올바르지 않습니다",
        });
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordValidation.errors.join(", "),
        });
      }

      // Check if new password is same as current
      const isSamePassword = await verifyPassword(newPassword, userData.passwordHash);
      if (isSamePassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "새 비밀번호는 현재 비밀번호와 달라야 합니다",
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Revoke all sessions (force re-login on all devices)
      await db.delete(sessions).where(eq(sessions.userId, user.id));

      // Log password change event
      await db.insert(authEvents).values({
        userId: user.id,
        eventType: "password_changed",
        ipAddress: (ctx as any).req?.headers?.get("x-forwarded-for") || "unknown",
        userAgent: (ctx as any).req?.headers?.get("user-agent") || "unknown",
        metadata: {},
      });

      return {
        success: true,
        message: "비밀번호가 변경되었습니다. 모든 기기에서 다시 로그인해주세요.",
      };
    }),

  /**
   * List all active sessions for current user
   * Requires authentication
   */
  sessions: protectedProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx as AuthenticatedContext;

    // Suppress type errors due to SQLite/PostgreSQL mismatch in development
    // @ts-ignore - SQLite/PostgreSQL type mismatch in development
    const userSessions = await db
      // @ts-ignore - SQLite/PostgreSQL type mismatch in development
      .select({
        id: sessions.id,
        userAgent: sessions.userAgent,
        ipAddress: sessions.ipAddress,
        createdAt: sessions.createdAt,
        updatedAt: sessions.updatedAt,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessions.createdAt)) as any[];

    // Get current session token to identify it
    const currentRefreshToken = (ctx as any).req?.cookies?.get("refresh_token")?.value;
    let currentSessionId: number | null = null;

    if (currentRefreshToken) {
      const tokenHash = await hashToken(currentRefreshToken);
      const currentSession = userSessions.find((s) => {
        // We'd need to compare hashes, but for now just return all
        return true;
      });
    }

    return {
      sessions: userSessions.map((session) => ({
        id: session.id,
        device: session.userAgent || "Unknown Device",
        ipAddress: session.ipAddress || "Unknown IP",
        lastActive: session.updatedAt,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isCurrent: false, // TODO: Determine if this is the current session
      })),
      count: userSessions.length,
      maxSessions: 5,
    };
  }),

  /**
   * Revoke a specific session
   * Requires authentication
   */
  revokeSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { sessionId } = input;

      // Check if session belongs to user
      const sessionResult = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)))
        .limit(1);

      const session = sessionResult[0];

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "세션을 찾을 수 없습니다",
        });
      }

      // Delete session
      await db.delete(sessions).where(eq(sessions.id, sessionId));

      // Log session revocation
      await db.insert(authEvents).values({
        userId: user.id,
        eventType: "session_revoked",
        ipAddress: (ctx as any).req?.headers?.get("x-forwarded-for") || "unknown",
        userAgent: (ctx as any).req?.headers?.get("user-agent") || "unknown",
        metadata: { sessionId },
      });

      return {
        success: true,
        message: "세션이 취소되었습니다",
      };
    }),

  /**
   * Revoke all sessions for current user (logout from all devices)
   * Requires authentication
   */
  revokeAllSessions: protectedProcedure.mutation(async ({ ctx }) => {
    const { user, db } = ctx as AuthenticatedContext;

    // Delete all sessions for user
    await db.delete(sessions).where(eq(sessions.userId, user.id));

    // Log session revocation
    await db.insert(authEvents).values({
      userId: user.id,
      eventType: "session_revoked",
      ipAddress: (ctx as any).req?.headers?.get("x-forwarded-for") || "unknown",
      userAgent: (ctx as any).req?.headers?.get("user-agent") || "unknown",
      metadata: { all: true },
    });

    return {
      success: true,
      message: "모든 세션이 취소되었습니다. 다시 로그인해주세요.",
    };
  }),
});
