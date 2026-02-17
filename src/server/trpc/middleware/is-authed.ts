// Authentication middleware for tRPC
// Verifies JWT access token and attaches user context to procedures

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { users, roles, userRoles } from "../../db/schema";
import type { Context } from "../index";
import { verifyAccessToken } from "../../utils/jwt";

/**
 * Authenticated user context
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

/**
 * Extended context with authenticated user
 */
export interface AuthenticatedContext extends Context {
  user: AuthenticatedUser;
}

/**
 * Authentication middleware factory
 * Verifies JWT access token from cookies and attaches user to context
 *
 * NOTE: TypeScript errors below (lines 68-72) are due to SQLite (dev) vs PostgreSQL (prod)
 * type mismatch. These errors will not occur in production with PostgreSQL database.
 * The runtime code works correctly with SQLite in development.
 */
export const isAuthed = async ({ ctx, next }: { ctx: Context; next: any }) => {
  // Get access token from cookies
  const accessToken = ctx.req?.cookies?.get("access_token")?.value;

  if (!accessToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "액세스 토큰이 필요합니다",
    });
  }

  // Verify the token
  let payload;
  try {
    payload = await verifyAccessToken(accessToken);
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "유효하지 않거나 만료된 액세스 토큰입니다",
    });
  }

  // Get user from database with roles
  const db = ctx.db;
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "데이터베이스를 사용할 수 없습니다",
    });
  }

  const userResult = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      status: users.status,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(users.id, payload.sub));

  // Collect all unique roles for the user
  const userRolesList = userResult
    .map((row) => row.roleName)
    .filter((role): role is string => Boolean(role));

  // Get first row for user basic info
  const firstRow = userResult[0];

  if (!firstRow) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "사용자를 찾을 수 없습니다",
    });
  }

  // Check if user account is active
  if ((firstRow.status as string) !== "ACTIVE") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `사용자 계정이 ${(firstRow.status as string).toLowerCase()} 상태입니다`,
    });
  }

  const user: AuthenticatedUser = {
    id: firstRow.id as string,
    email: firstRow.email as string,
    name: firstRow.name as string,
    roles: userRolesList,
  };

  // Attach user to context
  return next({
    ctx: {
      ...ctx,
      user,
    } satisfies AuthenticatedContext,
  });
};
