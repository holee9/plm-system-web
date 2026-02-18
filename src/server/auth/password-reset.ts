/**
 * Password Reset Service
 *
 * Handles password reset token generation, validation, and password updates.
 *
 * Features:
 * - Token generation with 1-hour expiration
 * - Token hashing for secure storage
 * - Email sending (or console logging in development)
 * - Password strength validation
 * - Token usage tracking (one-time use)
 * - AC-014: Password stored as bcrypt hash
 *
 * @task TASK-012
 */

import { hashToken, generateTokenId } from "@/server/utils/jwt";
import { hashPassword, validatePasswordStrength } from "@/server/utils/password";
import { eq } from "drizzle-orm";
import type { Context } from "@/server/trpc";
import { password_reset_tokens, users, auth_events } from "@/server/db/schema";

export interface PasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
  resetToken?: string; // Only in development
}

export interface RequestMetadata {
  ipAddress: string;
  userAgent: string;
}

/**
 * Password Reset Service
 *
 * Encapsulates password reset business logic separate from tRPC router.
 * This makes the logic testable and reusable across different contexts.
 */
export class PasswordResetService {
  private db: Context["db"];

  constructor(db: Context["db"]) {
    this.db = db;
  }

  /**
   * Request password reset for email
   *
   * Process:
   * 1. Find user by email
   * 2. Generate secure reset token
   * 3. Hash token and store in database with expiration
   * 4. Send email (or log token in development)
   *
   * Security: Always returns success to prevent email enumeration
   */
  async requestPasswordReset(
    email: string,
    metadata: RequestMetadata
  ): Promise<PasswordResetResult> {
    // Find user by email
    const userResult = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = userResult[0];

    // Always return success to prevent email enumeration
    // But only process if user exists
    if (!user) {
      return {
        success: true,
        message: "해당 이메일로 계정이 존재하면 비밀번호 재설정 링크가 발송되었습니다.",
      };
    }

    // Generate reset token
    const resetToken = generateTokenId();
    const resetTokenHash = await hashToken(resetToken);
    const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await this.db.insert(password_reset_tokens).values({
      userId: user.id,
      tokenHash: resetTokenHash,
      expiresAt: resetExpiresAt,
    });

    // Send email (or log in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Password reset token:", resetToken);
      console.log("Reset link:", `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);
    } else {
      // TODO: Send actual email
      // await sendPasswordResetEmail(user.email, resetToken);
    }

    // Log event for security audit
    await this.logAuthEvent(user.id, "PASSWORD_RESET_REQUESTED", metadata);

    return {
      success: true,
      message: "해당 이메일로 계정이 존재하면 비밀번호 재설정 링크가 발송되었습니다.",
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    };
  }

  /**
   * Reset password using token
   *
   * Process:
   * 1. Validate token format and existence
   * 2. Check if token is expired
   * 3. Check if token is already used
   * 4. Validate password strength
   * 5. Hash new password with bcrypt (AC-014)
   * 6. Update user password
   * 7. Mark token as used
   *
   * AC-014: Password stored as bcrypt hash
   */
  async resetPassword(
    token: string,
    newPassword: string,
    metadata: RequestMetadata
  ): Promise<PasswordResetResult> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.errors.join(", "),
      };
    }

    // Hash token to look up in database
    const tokenHash = await hashToken(token);

    // Find reset token
    const tokenResult = await this.db
      .select()
      .from(password_reset_tokens)
      .where(eq(password_reset_tokens.tokenHash, tokenHash))
      .limit(1);

    const resetToken = tokenResult[0];

    if (!resetToken) {
      return {
        success: false,
        error: "유효하지 않은 재설정 토큰입니다",
      };
    }

    // Check if token is already used
    if (resetToken.used) {
      return {
        success: false,
        error: "이미 사용된 재설정 토큰입니다. 다시 요청해주세요.",
      };
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return {
        success: false,
        error: "재설정 토큰이 만료되었습니다. 다시 요청해주세요.",
      };
    }

    // Get user
    const userResult = await this.db
      .select()
      .from(users)
      .where(eq(users.id, resetToken.userId))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다",
      };
    }

    // AC-014: Hash new password with bcrypt
    const newPasswordHash = await hashPassword(newPassword);

    // Update user password
    await this.db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Mark reset token as used
    await this.db
      .update(password_reset_tokens)
      .set({
        used: true,
        usedAt: new Date(),
      })
      .where(eq(password_reset_tokens.id, resetToken.id));

    // Log event for security audit
    await this.logAuthEvent(user.id, "PASSWORD_CHANGED", metadata);

    return {
      success: true,
      message: "비밀번호가 재설정되었습니다. 다시 로그인해주세요.",
    };
  }

  /**
   * Log authentication event
   *
   * Logs security events for audit trail and monitoring.
   */
  private async logAuthEvent(
    userId: string,
    eventType: string,
    metadata: RequestMetadata
  ): Promise<void> {
    try {
      await this.db.insert(auth_events).values({
        userId,
        eventType,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: {},
      });
    } catch (error) {
      // Don't throw - logging failures shouldn't break auth flow
      console.error("Failed to log auth event:", error);
    }
  }
}
