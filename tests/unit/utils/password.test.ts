// Password utility tests
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  needsRehash,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  BCRYPT_COST_FACTOR,
} from "@/server/utils/password";

// Mock bcrypt to speed up tests
// Use vi.hoisted to make variables available before hoisting
const { mockHash, mockVerify, mockGetRounds } = vi.hoisted(() => ({
  mockHash: vi.fn(),
  mockVerify: vi.fn(),
  mockGetRounds: vi.fn(),
}));

vi.mock("bcrypt-ts", () => ({
  hash: mockHash,
  compare: mockVerify, // Note: 'compare' is the export name in bcrypt-ts
  getRounds: mockGetRounds,
}));

describe("Password Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const plainPassword = "TestPassword123!";
      const hashedPassword = "$2a$12$abcdefghijklmnopqrstuv";

      mockHash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(plainPassword);

      expect(result).toBe(hashedPassword);
      expect(mockHash).toHaveBeenCalledWith(plainPassword, BCRYPT_COST_FACTOR);
    });

    it("should throw error for empty password", async () => {
      await expect(hashPassword("")).rejects.toThrow("비밀번호를 입력해주세요");
    });

    it("should throw error for password exceeding max length", async () => {
      const longPassword = "a".repeat(PASSWORD_MAX_LENGTH + 1);

      await expect(hashPassword(longPassword)).rejects.toThrow(
        `비밀번호는 ${PASSWORD_MAX_LENGTH}자를 초과할 수 없습니다`
      );
    });
  });

  describe("verifyPassword", () => {
    it("should return true for matching password", async () => {
      const plainPassword = "TestPassword123!";
      const hashedPassword = "$2a$12$abcdefghijklmnopqrstuv";

      mockVerify.mockResolvedValue(true);

      const result = await verifyPassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it("should return false for wrong password", async () => {
      const plainPassword = "WrongPassword";
      const hashedPassword = "$2a$12$abcdefghijklmnopqrstuv";

      mockVerify.mockResolvedValue(false);

      const result = await verifyPassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });

    it("should return false for empty password", async () => {
      const result = await verifyPassword("", "$2a$12$abcdefghijklmnopqrstuv");
      expect(result).toBe(false);
    });

    it("should return false for empty hash", async () => {
      const result = await verifyPassword("password", "");
      expect(result).toBe(false);
    });
  });

  describe("validatePasswordStrength", () => {
    it("should validate a strong password", () => {
      const result = validatePasswordStrength("TestPass123!");

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject password that is too short", () => {
      const result = validatePasswordStrength("Short1!");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다`
      );
    });

    it("should reject password that is too long", () => {
      const longPassword = "a".repeat(PASSWORD_MAX_LENGTH + 1) + "A1!";
      const result = validatePasswordStrength(longPassword);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `비밀번호는 ${PASSWORD_MAX_LENGTH}자를 초과할 수 없습니다`
      );
    });

    it("should reject password with only lowercase letters", () => {
      const result = validatePasswordStrength("abcdefgh");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "비밀번호는 다음 3가지 이상을 포함해야 합니다: 대문자, 소문자, 숫자, 특수문자"
      );
    });

    it("should reject password with only 2 character types", () => {
      const result = validatePasswordStrength("abcdefgh");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "비밀번호는 다음 3가지 이상을 포함해야 합니다: 대문자, 소문자, 숫자, 특수문자"
      );
    });

    it("should accept password with uppercase, lowercase, and numbers", () => {
      const result = validatePasswordStrength("TestPass123");

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should accept password with lowercase, numbers, and special characters", () => {
      const result = validatePasswordStrength("test123!@#");

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should accept password with uppercase, lowercase, and special characters", () => {
      const result = validatePasswordStrength("TestPass!");

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should return multiple errors for very weak password", () => {
      const result = validatePasswordStrength("abc");

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("needsRehash", () => {
    it("should return true if cost factor is different", () => {
      const hash = "$2a$10$abcdefghijklmnopqrstuv"; // cost factor 10

      mockGetRounds.mockReturnValue(10);

      const result = needsRehash(hash);

      expect(result).toBe(true);
    });

    it("should return false if cost factor matches", () => {
      const hash = "$2a$12$abcdefghijklmnopqrstuv"; // cost factor 12

      mockGetRounds.mockReturnValue(BCRYPT_COST_FACTOR);

      const result = needsRehash(hash);

      expect(result).toBe(false);
    });
  });
});
