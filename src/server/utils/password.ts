// Password utility functions using bcrypt-ts
// Handles password hashing, verification, and complexity validation

import { hash as bcryptHash, compare as bcryptCompare, getRounds } from "bcrypt-ts";
import { TRPCError } from "@trpc/server";

// Password complexity requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;
export const BCRYPT_COST_FACTOR = 12;

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Hash a password using bcrypt
 * @param plainPassword - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || plainPassword.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "비밀번호를 입력해주세요",
    });
  }

  if (plainPassword.length > PASSWORD_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `비밀번호는 ${PASSWORD_MAX_LENGTH}자를 초과할 수 없습니다`,
    });
  }

  return await bcryptHash(plainPassword, BCRYPT_COST_FACTOR);
}

/**
 * Verify a password against a hash
 * @param plainPassword - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  return await bcryptCompare(plainPassword, hashedPassword);
}

/**
 * Validate password complexity
 * Requirements:
 * - At least 8 characters long
 * - At least 3 of the following: uppercase, lowercase, numbers, special characters
 *
 * @param password - Password to validate
 * @returns Validation result with errors if invalid
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다`);
  }

  // Check maximum length
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`비밀번호는 ${PASSWORD_MAX_LENGTH}자를 초과할 수 없습니다`);
  }

  // Count character types
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const characterTypeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

  // Require at least 3 character types
  if (characterTypeCount < 3) {
    errors.push(
      "비밀번호는 다음 3가지 이상을 포함해야 합니다: 대문자, 소문자, 숫자, 특수문자"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a password needs to be rehashed (for bcrypt cost factor upgrades)
 * @param hash - Bcrypt hash to check
 * @returns True if password should be rehashed
 */
export function needsRehash(hash: string): boolean {
  return getRounds(hash) !== BCRYPT_COST_FACTOR;
}
