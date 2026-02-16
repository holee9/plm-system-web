// Authorization middleware for tRPC
// Implements role-based access control (RBAC)

import { TRPCError } from "@trpc/server";
import type { AuthenticatedContext } from "./is-authed";

/**
 * Role-based authorization middleware factory
 * Checks if authenticated user has required roles
 *
 * @param requiredRoles - Array of role names that are allowed access
 * @returns tRPC middleware function
 *
 * @example
 * ```ts
 * // Admin only procedure
 * export const adminProcedure = protectedProcedure.use(authorized(['admin']));
 *
 * // Admin or owner procedure
 * export const adminOrOwnerProcedure = protectedProcedure.use(authorized(['admin', 'owner']));
 * ```
 */
export const authorized = (requiredRoles: string[]) => {
  return async ({ ctx, next }: { ctx: AuthenticatedContext; next: any }) => {
    // Check if user is authenticated
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "인증이 필요합니다",
      });
    }

    // Check if user has any of the required roles
    const userRoles = ctx.user.roles || [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `권한이 없습니다. 필요한 역할: ${requiredRoles.join(", ")}`,
      });
    }

    // User is authorized, proceed
    return next({
      ctx,
    });
  };
};

/**
 * Pre-configured authorization middlewares for common roles
 */
export const isAdmin = authorized(["admin"]);
export const isOwner = authorized(["owner", "admin"]);
export const isMember = authorized(["member", "owner", "admin"]);
export const isViewer = authorized(["viewer", "member", "owner", "admin"]);
