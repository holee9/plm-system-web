// @vitest-environment node
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, validatePasswordComplexity } from "../../src/lib/password";

describe("Password Utility", () => {
  describe("Password Complexity Validation", () => {
    it("should accept a valid password with 3 of 4 character types", () => {
      const result = validatePasswordComplexity("Test123!");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject password shorter than 8 characters", () => {
      const result = validatePasswordComplexity("Test1!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters long");
    });

    it("should reject password with only lowercase", () => {
      const result = validatePasswordComplexity("abcdefgh");
      expect(result.valid).toBe(false);
    });

    it("should reject password with only 1 character type", () => {
      const result = validatePasswordComplexity("abcdefgh");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject password with only 2 character types", () => {
      const result = validatePasswordComplexity("abcdefgh1234");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should accept password with exactly 3 character types", () => {
      const result = validatePasswordComplexity("Test1234");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should provide specific error messages", () => {
      const result = validatePasswordComplexity("short");
      expect(result.errors).toEqual([
        "Password must be at least 8 characters long",
        "Password must contain at least 3 of: uppercase, lowercase, number, special character",
      ]);
    });
  });

  describe("Password Hashing", () => {
    it("should hash a password successfully", async () => {
      const password = "Test123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "Test123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Password Verification", () => {
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
  });
});
