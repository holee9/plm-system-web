// Base tRPC procedures with authentication middleware
// Exports publicProcedure and protectedProcedure for use in routers

import { publicProcedure, router } from "./index";
import { isAuthed } from "./middleware/is-authed";
import { authorized } from "./middleware/authorization";

/**
 * Public procedure - No authentication required
 * Use for endpoints like login, register, password reset
 */
export { publicProcedure };

/**
 * Protected procedure - Authentication required
 * Verifies JWT access token and attaches user to context
 *
 * @example
 * ```ts
 * export const userRouter = router({
 *   me: protectedProcedure.query(async ({ ctx }) => {
 *     return ctx.user; // User is guaranteed to be authenticated
 *   }),
 * });
 * ```
 */
// Suppress type errors due to middleware context transformation
export const protectedProcedure = publicProcedure.use(isAuthed as any);

/**
 * Admin procedure - Admin role required
 * Shortcut for protectedProcedure.use(authorized(['admin']))
 */
export const adminProcedure = protectedProcedure.use(authorized(["admin"]));

/**
 * Owner procedure - Owner or Admin role required
 */
export const ownerProcedure = protectedProcedure.use(authorized(["owner", "admin"]));

/**
 * Member procedure - Member, Owner, or Admin role required
 */
export const memberProcedure = protectedProcedure.use(authorized(["member", "owner", "admin"]));

/**
 * Viewer procedure - Viewer, Member, Owner, or Admin role required
 * (All authenticated users have at least viewer role)
 */
export const viewerProcedure = protectedProcedure.use(
  authorized(["viewer", "member", "owner", "admin"])
);

// Re-export for convenience
export { router, authorized };
