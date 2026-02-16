import { randomBytes, createHash } from "crypto";

// Token types for email verification and password reset
export interface EmailVerificationToken {
  userId: number;
  email: string;
  expiresAt: Date;
}

export interface PasswordResetToken {
  userId: number;
  tokenId: string;
  expiresAt: Date;
}

// Generate a secure random token ID
export function generateTokenId(): string {
  return randomBytes(32).toString("base64url");
}

// Hash a token for storage in database
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Generate email verification token content
export function generateEmailVerificationContent(userId: number, email: string): string {
  const timestamp = Date.now();
  const data = `${userId}:${email}:${timestamp}`;
  return randomBytes(16).toString("base64url") + "." + Buffer.from(data).toString("base64url");
}

// Token expiration utilities
export const TOKEN_EXPIRATION = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
  ACCESS_TOKEN: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// Session management constants
export const SESSION_CONFIG = {
  MAX_SESSIONS_PER_USER: 5,
  SESSION_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  ACCOUNT_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  MAX_FAILED_ATTEMPTS: 5,
} as const;

// Check if account is locked
export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return new Date() < lockedUntil;
}

// Calculate lockout expiration
export function calculateLockoutExpiration(failedAttempts: number): Date | null {
  if (failedAttempts < RATE_LIMIT_CONFIG.MAX_FAILED_ATTEMPTS) {
    return null;
  }

  return new Date(Date.now() + RATE_LIMIT_CONFIG.ACCOUNT_LOCKOUT_DURATION);
}

// Authentication event types
export enum AuthEventType {
  LOGIN = "login",
  LOGOUT = "logout",
  REGISTER = "register",
  PASSWORD_RESET = "password_reset",
  EMAIL_VERIFIED = "email_verified",
  ACCOUNT_LOCKED = "account_locked",
  ACCOUNT_UNLOCKED = "account_unlocked",
  PASSWORD_CHANGED = "password_changed",
  SESSION_REVOKED = "session_revoked",
  FAILED_LOGIN = "failed_login",
}

// User status enum
export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
  DEACTIVATED = "DEACTIVATED",
}
