// @vitest-environment node
// JWT utility tests for SPEC-PLM-002
// Tests for access token and refresh token generation/verification

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenId,
  hashToken,
} from "@/server/utils/jwt";

// Mock environment variables
const originalEnv = process.env;

describe("JWT Utility (SPEC-PLM-002)", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = "test-secret-key-at-least-32-characters-long-for-hs256";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-at-least-32-characters-long-for-hs256";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("generateAccessToken", () => {
    it("should generate an access token with userId, email, and roles", async () => {
      const userId = "123";
      const email = "test@example.com";
      const roles = ["user", "admin"];

      const token = await generateAccessToken(userId, email, roles);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT format: header.payload.signature
    });

    it("should generate token with 15 minute expiration", async () => {
      const token = await generateAccessToken("123", "test@example.com", []);

      // Decode payload (without verification)
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

      const now = Math.floor(Date.now() / 1000);
      const exp = payload.exp;

      // Expiration should be approximately 15 minutes from now
      expect(exp).toBeGreaterThan(now + 14 * 60);
      expect(exp).toBeLessThan(now + 16 * 60);
    });

    it("should include user claims in payload", async () => {
      const userId = "123";
      const email = "test@example.com";
      const roles = ["user", "admin"];

      const token = await generateAccessToken(userId, email, roles);

      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

      expect(payload.sub).toBe(userId);
      expect(payload.email).toBe(email);
      expect(payload.roles).toEqual(roles);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token", async () => {
      const userId = "123";
      const email = "test@example.com";
      const roles = ["user"];
      const token = await generateAccessToken(userId, email, roles);

      const payload = await verifyAccessToken(token);

      expect(payload.sub).toBe(userId);
      expect(payload.email).toBe(email);
      expect(payload.roles).toEqual(roles);
    });

    it("should reject an expired token", async () => {
      // Create a token that's already expired
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      const expiredToken = await new SignJWT({ sub: "123", email: "test@example.com", roles: [] })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("0s")
        .sign(secret);

      await expect(verifyAccessToken(expiredToken)).rejects.toThrow();
    });

    it("should reject a token with invalid signature", async () => {
      const invalidToken = "header.payload.invalid-signature";

      await expect(verifyAccessToken(invalidToken)).rejects.toThrow();
    });

    it("should reject a token signed with wrong secret", async () => {
      const { SignJWT } = await import("jose");
      const wrongSecret = new TextEncoder().encode("wrong-secret-key-at-least-32-characters");

      const token = await new SignJWT({ sub: "123", email: "test@example.com", roles: [] })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(wrongSecret);

      await expect(verifyAccessToken(token)).rejects.toThrow();
    });

    it("should reject malformed token", async () => {
      await expect(verifyAccessToken("not-a-jwt")).rejects.toThrow();
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a refresh token with userId and tokenId", async () => {
      const userId = "123";
      const tokenId = "token-abc-123";

      const token = await generateRefreshToken(userId, tokenId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should generate token with 7 day expiration", async () => {
      const token = await generateRefreshToken("123", "token-id");

      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

      const now = Math.floor(Date.now() / 1000);
      const exp = payload.exp;

      // Expiration should be approximately 7 days from now
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      expect(exp).toBeGreaterThan(now + sevenDaysInSeconds - 100);
      expect(exp).toBeLessThan(now + sevenDaysInSeconds + 100);
    });

    it("should include userId and tokenId in payload", async () => {
      const userId = "123";
      const tokenId = "token-xyz-789";

      const token = await generateRefreshToken(userId, tokenId);

      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

      expect(payload.sub).toBe(userId);
      expect(payload.tokenId).toBe(tokenId);
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token", async () => {
      const userId = "123";
      const tokenId = "token-abc-123";
      const token = await generateRefreshToken(userId, tokenId);

      const payload = await verifyRefreshToken(token);

      expect(payload.sub).toBe(userId);
      expect(payload.tokenId).toBe(tokenId);
    });

    it("should reject an expired refresh token", async () => {
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

      const expiredToken = await new SignJWT({ sub: "123", tokenId: "token-id" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("0s")
        .sign(secret);

      await expect(verifyRefreshToken(expiredToken)).rejects.toThrow();
    });

    it("should reject a refresh token with invalid signature", async () => {
      const invalidToken = "header.payload.invalid-signature";

      await expect(verifyRefreshToken(invalidToken)).rejects.toThrow();
    });
  });

  describe("generateTokenId", () => {
    it("should generate a unique token ID", () => {
      const id1 = generateTokenId();
      const id2 = generateTokenId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it("should generate alphanumeric token ID", () => {
      const id = generateTokenId();

      // Token ID can contain alphanumeric characters, hyphens, and underscores
      expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
      expect(id.length).toBeGreaterThan(10);
    });
  });

  describe("hashToken", () => {
    it("should hash a token consistently", async () => {
      const token = "raw-token-value";

      const hash1 = await hashToken(token);
      const hash2 = await hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different tokens", async () => {
      const hash1 = await hashToken("token1");
      const hash2 = await hashToken("token2");

      expect(hash1).not.toBe(hash2);
    });

    it("should not leak original token in hash", async () => {
      const token = "secret-token-value";
      const hash = await hashToken(token);

      expect(hash).not.toContain(token);
    });
  });

  describe("NFR-005: Session expiration (30 days)", () => {
    it("refresh token should have 7 day expiration (less than 30 day session)", async () => {
      const token = await generateRefreshToken("123", "token-id");

      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

      const now = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      expect(payload.exp - payload.iat).toBeCloseTo(sevenDaysInSeconds, 0);
    });
  });
});
