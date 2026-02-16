// JWT utilities - Re-export from lib/jwt with additional utilities
// This file provides backward compatibility for existing imports

import {
  signAccessToken,
  verifyAccessToken as baseVerifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from "../lib/jwt";

// Rename functions to match the expected API in auth router
export async function generateAccessToken(
  userId: string,
  email: string,
  roles: string[] = []
): Promise<string> {
  return await signAccessToken({
    userId: parseInt(userId, 10),
    email,
    roles,
  });
}

export async function generateRefreshToken(
  userId: string,
  tokenId: string
): Promise<string> {
  return await signRefreshToken({
    userId: parseInt(userId, 10),
    tokenId,
  });
}

// Wrapper for verifyAccessToken that returns payload with sub property
export async function verifyAccessToken(token: string): Promise<{ sub: string; email: string; roles?: string[] }> {
  const payload = await baseVerifyAccessToken(token);
  return {
    sub: payload.userId.toString(),
    email: payload.email,
    roles: (payload as any).roles,
  };
}

export { verifyRefreshToken };

// Export hash token utility
import { createHash } from "crypto";
export async function hashToken(token: string): Promise<string> {
  return createHash("sha256").update(token).digest("hex");
}

// Export types
export type { AccessTokenPayload, RefreshTokenPayload };
