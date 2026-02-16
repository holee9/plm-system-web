// JWT utility functions using jose library
// Handles access token (15min) and refresh token (7day) generation and verification

import { SignJWT, jwtVerify } from "jose";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";

// Secret keys for JWT signing
// In production, these should come from environment variables
const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET || "test-access-secret-key-at-least-32-chars-long-for-security";
  return new TextEncoder().encode(secret);
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || "test-refresh-secret-key-at-least-32-chars-long-for-security";
  return new TextEncoder().encode(secret);
};

// JWT payload types
export interface AccessTokenPayload {
  sub: string; // User ID
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  tokenId: string; // Unique identifier for this refresh token
  iat: number;
  exp: number;
}

export interface JWTPayload {
  sub: string;
  [key: string]: unknown;
}

/**
 * Generate an access token with 15 minute expiration
 * @param userId - User ID
 * @param email - User email
 * @param roles - User roles
 * @returns Signed JWT access token
 */
export async function generateAccessToken(
  userId: string,
  email: string,
  roles: string[] = []
): Promise<string> {
  const secret = getAccessSecret();

  return await new SignJWT({ sub: userId, email, roles })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

/**
 * Alias for generateAccessToken for compatibility
 * @deprecated Use generateAccessToken instead
 */
export const signAccessToken = generateAccessToken;

/**
 * Generate a refresh token with 7 day expiration
 * @param userId - User ID
 * @param tokenId - Unique identifier for this token (stored in DB)
 * @returns Signed JWT refresh token
 */
export async function generateRefreshToken(
  userId: string,
  tokenId: string
): Promise<string> {
  const secret = getRefreshSecret();

  return await new SignJWT({ sub: userId, tokenId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Alias for generateRefreshToken for compatibility
 * @deprecated Use generateRefreshToken instead
 */
export const signRefreshToken = generateRefreshToken;

/**
 * Verify an access token
 * @param token - JWT access token
 * @returns Decoded token payload
 * @throws TRPCError if token is invalid or expired
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  try {
    const secret = getAccessSecret();
    const { payload } = await jwtVerify(token, secret);

    // Validate required fields
    if (!payload.sub || !payload.email) {
      throw new Error("Invalid token payload");
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      roles: (payload.roles as string[]) || [],
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired access token",
    });
  }
}

/**
 * Verify a refresh token
 * @param token - JWT refresh token
 * @returns Decoded token payload
 * @throws TRPCError if token is invalid or expired
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  try {
    const secret = getRefreshSecret();
    const { payload } = await jwtVerify(token, secret);

    // Validate required fields
    if (!payload.sub || !payload.tokenId) {
      throw new Error("Invalid token payload");
    }

    return {
      sub: payload.sub as string,
      tokenId: payload.tokenId as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired refresh token",
    });
  }
}

/**
 * Decode a JWT without verification (for debugging/testing only)
 * @param token - JWT token
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Hash a token for secure storage in database
 * Uses SHA-256 to create a one-way hash of the token
 * @param token - Token to hash
 * @returns Hex-encoded hash of the token
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a secure random token ID
 * @returns Random 32-byte token ID in base64url encoding
 */
export function generateTokenId(): string {
  const crypto = require("node:crypto");
  return crypto.randomBytes(32).toString("base64url");
}
