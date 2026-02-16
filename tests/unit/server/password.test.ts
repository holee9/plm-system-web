// @vitest-environment node
// Password utility tests for SPEC-PLM-002
// Tests for bcrypt hashing, verification, and password complexity validation

import { describe, it, expect, beforeEach } from "vitest";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  BCRYPT_COST_FACTOR,
  needsRehash,
  type PasswordValidationResult,
} from "@/server/utils/password";

describe("Password Utility (SPEC-PLM-002)", () => {
  describe("validatePasswordStrength", () => {
    describe("NFR-004: Password complexity requirements", () => {
      it("should accept password with 8+ chars and 3 types (uppercase, lowercase, number)", () => {
        const result = validatePasswordStrength("Test1234");
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should accept password with 8+ chars and 4 types (including special char)", () => {
        const result = validatePasswordStrength("Test123!");
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should reject password shorter than 8 characters", () => {
        const result = validatePasswordStrength("Test1!");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다`);
      });

      it("should reject password with only lowercase letters", () => {
        const result = validatePasswordStrength("abcdefgh");
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should reject password with only 2 character types", () => {
        const result = validatePasswordStrength("abcdefgh1234");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("비밀번호는 다음 3가지 이상을 포함해야 합니다: 대문자, 소문자, 숫자, 특수문자");
      });

      it("should reject password longer than max length", () => {
        const longPassword = "A".repeat(PASSWORD_MAX_LENGTH + 1);
        const result = validatePasswordStrength(longPassword);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`비밀번호는 ${PASSWORD_MAX_LENGTH}자를 초과할 수 없습니다`);
      });

      it("should provide all error messages for invalid password", () => {
        const result = validatePasswordStrength("short");
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe("Edge cases", () => {
      it("should handle empty string", () => {
        const result = validatePasswordStrength("");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다`);
      });

      it("should handle whitespace-only password", () => {
        const result = validatePasswordStrength("        ");
        expect(result.valid).toBe(false);
      });

      it("should accept password with special characters at various positions", () => {
        const result1 = validatePasswordStrength("!Test1234");
        const result2 = validatePasswordStrength("Test!1234");
        const result3 = validatePasswordStrength("Test1234!");
        expect(result1.valid).toBe(true);
        expect(result2.valid).toBe(true);
        expect(result3.valid).toBe(true);
      });
    });
  });

  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "Test123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash.startsWith("$2a$")).toBe(true); // bcrypt hash format
    });

    it("should generate different hashes for the same password (salt)", async () => {
      const password = "Test123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should throw error for empty password", async () => {
      await expect(hashPassword("")).rejects.toThrow("비밀번호를 입력해주세요");
    });

    it("should throw error for password exceeding max length", async () => {
      const longPassword = "A".repeat(PASSWORD_MAX_LENGTH + 1);
      await expect(hashPassword(longPassword)).rejects.toThrow();
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "Test123!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "Test123!";
      const wrongPassword = "Wrong123!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should reject empty password", async () => {
      const password = "Test123!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("", hash);
      expect(isValid).toBe(false);
    });

    it("should reject with empty hash", async () => {
      const isValid = await verifyPassword("Test123!", "");
      expect(isValid).toBe(false);
    });

    it("should verify password against different hash", async () => {
      const password = "Test123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe("needsRehash", () => {
    it("should return false for hash with current cost factor", async () => {
      const password = "Test123!";
      const hash = await hashPassword(password);

      expect(needsRehash(hash)).toBe(false);
    });
  });

  describe("Password security integration", () => {
    it("should use bcrypt cost factor 12", async () => {
      const password = "Test123!";
      const hash = await hashPassword(password);

      // Extract cost factor from bcrypt hash
      // Format: $2a$[cost]$[salt][hash]
      const match = hash.match(/^\$2a\$(\d+)\$/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toBe(String(BCRYPT_COST_FACTOR));
    });

    it("should not leak timing information", async () => {
      const password = "Test123!";
      const hash = await hashPassword(password);

      const start1 = Date.now();
      await verifyPassword("correct", hash);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await verifyPassword("wrong", hash);
      const time2 = Date.now() - start2;

      // Timing difference should be minimal (bcrypt is constant time for comparison)
      expect(Math.abs(time1 - time2)).toBeLessThan(100);
    });
  });
});
