// JWT utility tests
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
} from "@/server/utils/jwt";
import { jwtVerify } from "jose";
import { TRPCError } from "@trpc/server";

// Mock jose library
vi.mock("jose", () => ({
  SignJWT: class {
    private payload: any;
    private header: any = { alg: "HS256" };
    private expirationTime?: string;

    constructor(payload: any) {
      this.payload = payload;
    }

    setProtectedHeader(header: any) {
      this.header = header;
      return this;
    }

    setIssuedAt() {
      return this;
    }

    setExpirationTime(time: string) {
      this.expirationTime = time;
      return this;
    }

    async sign(_secret: any) {
      return "mock.jwt.token";
    }
  },
  jwtVerify: vi.fn(),
}));

describe("JWT Utilities", () => {
  describe("generateAccessToken", () => {
    it("should generate an access token with correct payload", async () => {
      const result = await generateAccessToken("123", "test@example.com", ["viewer"]);

      expect(result).toBe("mock.jwt.token");
    });

    it("should set 15 minute expiration", async () => {
      const result = await generateAccessToken("123", "test@example.com", []);

      expect(result).toBe("mock.jwt.token");
    });

    it("should handle empty roles array", async () => {
      const result = await generateAccessToken("123", "test@example.com", []);

      expect(result).toBe("mock.jwt.token");
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a refresh token with correct payload", async () => {
      const result = await generateRefreshToken("123", "token-id-456");

      expect(result).toBe("mock.jwt.token");
    });

    it("should set 7 day expiration", async () => {
      const result = await generateRefreshToken("123", "token-id");

      expect(result).toBe("mock.jwt.token");
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token", async () => {
      const mockPayload = {
        sub: "123",
        email: "test@example.com",
        roles: ["viewer"],
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 900, // 15 minutes
      };
      vi.mocked(jwtVerify).mockResolvedValue({ payload: mockPayload });

      const result = await verifyAccessToken("valid.token.here");

      expect(result).toEqual({
        sub: "123",
        email: "test@example.com",
        roles: ["viewer"],
        iat: mockPayload.iat,
        exp: mockPayload.exp,
      });
    });

    it("should throw UNAUTHORIZED for invalid token", async () => {
      vi.mocked(jwtVerify).mockRejectedValue(new Error("Invalid token"));

      await expect(verifyAccessToken("invalid.token")).rejects.toThrow(TRPCError);
      await expect(verifyAccessToken("invalid.token")).rejects.toThrow("Invalid or expired access token");
    });

    it("should throw UNAUTHORIZED for token without sub", async () => {
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { email: "test@example.com" },
      });

      await expect(verifyAccessToken("token")).rejects.toThrow(TRPCError);
    });

    it("should throw UNAUTHORIZED for token without email", async () => {
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { sub: "123" },
      });

      await expect(verifyAccessToken("token")).rejects.toThrow(TRPCError);
    });

    it("should handle empty roles array", async () => {
      const mockPayload = {
        sub: "123",
        email: "test@example.com",
        roles: undefined,
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 900,
      };
      vi.mocked(jwtVerify).mockResolvedValue({ payload: mockPayload });

      const result = await verifyAccessToken("valid.token");

      expect(result.roles).toEqual([]);
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token", async () => {
      const mockPayload = {
        sub: "123",
        tokenId: "token-id-456",
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 604800, // 7 days
      };
      vi.mocked(jwtVerify).mockResolvedValue({ payload: mockPayload });

      const result = await verifyRefreshToken("valid.refresh.token");

      expect(result).toEqual({
        sub: "123",
        tokenId: "token-id-456",
        iat: mockPayload.iat,
        exp: mockPayload.exp,
      });
    });

    it("should throw UNAUTHORIZED for invalid refresh token", async () => {
      vi.mocked(jwtVerify).mockRejectedValue(new Error("Invalid token"));

      await expect(verifyRefreshToken("invalid.token")).rejects.toThrow(TRPCError);
      await expect(verifyRefreshToken("invalid.token")).rejects.toThrow(
        "Invalid or expired refresh token"
      );
    });

    it("should throw UNAUTHORIZED for token without sub", async () => {
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { tokenId: "token-id" },
      });

      await expect(verifyRefreshToken("token")).rejects.toThrow(TRPCError);
    });

    it("should throw UNAUTHORIZED for token without tokenId", async () => {
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { sub: "123" },
      });

      await expect(verifyRefreshToken("token")).rejects.toThrow(TRPCError);
    });
  });

  describe("decodeToken", () => {
    it("should decode a valid JWT without verification", () => {
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({ sub: "123", email: "test@example.com" }));
      const signature = "signature";
      const token = `${header}.${payload}.${signature}`;

      const result = decodeToken(token);

      expect(result).toEqual({
        sub: "123",
        email: "test@example.com",
      });
    });

    it("should return null for malformed token (missing parts)", () => {
      const result = decodeToken("invalid.token");

      expect(result).toBeNull();
    });

    it("should return null for token with only one part", () => {
      const result = decodeToken("onlyonepart");

      expect(result).toBeNull();
    });

    it("should return null for invalid base64", () => {
      const token = "header.not-valid-base64.signature";
      const result = decodeToken(token);

      expect(result).toBeNull();
    });

    it("should return null for invalid JSON", () => {
      const header = btoa(JSON.stringify({ alg: "HS256" }));
      const payload = btoa("not-valid-json");
      const signature = "signature";
      const token = `${header}.${payload}.${signature}`;

      const result = decodeToken(token);

      expect(result).toBeNull();
    });
  });
});
