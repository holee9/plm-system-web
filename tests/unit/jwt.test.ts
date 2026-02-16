// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { SignJWT, jwtVerify } from "jose";

describe("JWT Utility", () => {
  const secret = new TextEncoder().encode("test-secret-key-at-least-32-chars-long");
  const refreshSecret = new TextEncoder().encode("test-refresh-secret-key-at-least-32-chars-long");

  describe("Access Token", () => {
    it("should sign an access token with 15 minute expiration", async () => {
      const payload = { userId: 1, email: "test@example.com" };
      const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(secret);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should verify a valid access token", async () => {
      const payload = { userId: 1, email: "test@example.com" };
      const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(secret);

      const { payload: verifiedPayload } = await jwtVerify(token, secret);

      expect(verifiedPayload.userId).toBe(1);
      expect(verifiedPayload.email).toBe("test@example.com");
    });

    it("should reject an expired token", async () => {
      const payload = { userId: 1, email: "test@example.com" };
      const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("0s") // Already expired
        .sign(secret);

      await expect(jwtVerify(token, secret)).rejects.toThrow();
    });

    it("should reject a token with invalid signature", async () => {
      const payload = { userId: 1, email: "test@example.com" };
      const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(secret);

      const wrongSecret = new TextEncoder().encode("wrong-secret-key");

      await expect(jwtVerify(token, wrongSecret)).rejects.toThrow();
    });
  });

  describe("Refresh Token", () => {
    it("should sign a refresh token with 7 day expiration", async () => {
      const payload = { userId: 1, tokenId: "abc123" };
      const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(refreshSecret);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should verify a valid refresh token", async () => {
      const payload = { userId: 1, tokenId: "abc123" };
      const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(refreshSecret);

      const { payload: verifiedPayload } = await jwtVerify(token, refreshSecret);

      expect(verifiedPayload.userId).toBe(1);
      expect(verifiedPayload.tokenId).toBe("abc123");
    });
  });
});
