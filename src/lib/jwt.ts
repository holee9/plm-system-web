import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Token types
export interface AccessTokenPayload extends JWTPayload {
  userId: number;
  email: string;
}

export interface RefreshTokenPayload extends JWTPayload {
  userId: number;
  tokenId: string;
}

// Get JWT secrets from environment
const getAccessSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

// Access token (15 minutes)
export async function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): Promise<string> {
  const secret = getAccessSecret();

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const secret = getAccessSecret();

  const { payload } = await jwtVerify(token, secret);

  return payload as AccessTokenPayload;
}

// Refresh token (7 days)
export async function signRefreshToken(payload: Omit<RefreshTokenPayload, "iat" | "exp">): Promise<string> {
  const secret = getRefreshSecret();

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const secret = getRefreshSecret();

  const { payload } = await jwtVerify(token, secret);

  return payload as RefreshTokenPayload;
}

// Email verification token (24 hours)
export async function signEmailVerificationToken(payload: { userId: number; email: string }): Promise<string> {
  const secret = getAccessSecret();

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyEmailVerificationToken(token: string): Promise<{ userId: number; email: string }> {
  const secret = getAccessSecret();

  const { payload } = await jwtVerify(token, secret);

  return payload as { userId: number; email: string };
}

// Password reset token (1 hour)
export async function signPasswordResetToken(payload: { userId: number }): Promise<string> {
  const secret = getAccessSecret();

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

export async function verifyPasswordResetToken(token: string): Promise<{ userId: number }> {
  const secret = getAccessSecret();

  const { payload } = await jwtVerify(token, secret);

  return payload as { userId: number };
}
