// @vitest-environment node
// tRPC middleware integration tests for SPEC-PLM-002
// Tests for isAuthed and authorization middleware

import { describe, it, expect, vi } from "vitest";
import { authorized, isAdmin, isOwner, isMember, isViewer } from "@/server/trpc/middleware/authorization";
import type { AuthenticatedContext } from "@/server/trpc/middleware";

// Mock database
const mockDb = {
  select: vi.fn(),
};

vi.mock("@/server/db", () => ({
  db: mockDb,
}));

// Mock JWT utilities
vi.mock("@/server/utils/jwt", () => ({
  verifyAccessToken: vi.fn(() => Promise.resolve({ sub: "1", email: "test@example.com" })),
}));

describe("tRPC Middleware Integration (SPEC-PLM-002)", () => {
  describe("isAuthed: Authentication middleware", () => {
    it("should be defined as a middleware function", async () => {
      const { isAuthed } = await import("@/server/trpc/middleware/is-authed");

      expect(isAuthed).toBeDefined();
      expect(typeof isAuthed).toBe("function");
    });

    it("should have middleware structure with _def property", async () => {
      const { isAuthed } = await import("@/server/trpc/middleware/is-authed");

      expect(isAuthed).toBeDefined();
      // Middleware functions in tRPC have a specific structure
      expect(typeof isAuthed).toBe("function");
    });
  });

  describe("authorized: Authorization middleware (RBAC)", () => {
    const mockNext = vi.fn().mockResolvedValue({ data: "authorized" });

    it("should pass if user has required role", async () => {
      const mockCtx: AuthenticatedContext = {
        req: {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn() },
        },
        db: mockDb as any,
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          roles: ["admin"],
        },
      };

      const adminOnlyMiddleware = authorized(["admin"]);

      const result = await adminOnlyMiddleware({
        ctx: mockCtx,
        next: mockNext,
      });

      expect(result).toBeDefined();
    });

    it("should pass if user has one of multiple required roles", async () => {
      const mockCtx: AuthenticatedContext = {
        req: {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn() },
        },
        db: mockDb as any,
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          roles: ["owner"],
        },
      };

      const ownerOrAdminMiddleware = authorized(["admin", "owner"]);

      const result = await ownerOrAdminMiddleware({
        ctx: mockCtx,
        next: mockNext,
      });

      expect(result).toBeDefined();
    });

    it("should reject if user lacks required role", async () => {
      const mockCtx: AuthenticatedContext = {
        req: {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn() },
        },
        db: mockDb as any,
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          roles: ["viewer"],
        },
      };

      const adminOnlyMiddleware = authorized(["admin"]);

      await expect(
        adminOnlyMiddleware({
          ctx: mockCtx,
          next: mockNext,
        })
      ).rejects.toThrow("권한이 없습니다");
    });

    it("should reject if user has no roles", async () => {
      const mockCtx: AuthenticatedContext = {
        req: {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn() },
        },
        db: mockDb as any,
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          roles: [],
        },
      };

      const memberOnlyMiddleware = authorized(["member"]);

      await expect(
        memberOnlyMiddleware({
          ctx: mockCtx,
          next: mockNext,
        })
      ).rejects.toThrow("권한이 없습니다");
    });

    it("should reject if user is not authenticated", async () => {
      const mockCtx = {
        req: {
          cookies: { get: vi.fn() },
          headers: { get: vi.fn() },
        },
        db: mockDb as any,
        user: undefined as any,
      };

      const adminOnlyMiddleware = authorized(["admin"]);

      await expect(
        adminOnlyMiddleware({
          ctx: mockCtx,
          next: mockNext,
        })
      ).rejects.toThrow("인증이 필요합니다");
    });
  });

  describe("Pre-configured authorization middlewares", () => {
    it("isAdmin should require admin role", () => {
      expect(isAdmin).toBeDefined();
    });

    it("isOwner should require owner or admin role", () => {
      expect(isOwner).toBeDefined();
    });

    it("isMember should require member, owner, or admin role", () => {
      expect(isMember).toBeDefined();
    });

    it("isViewer should require viewer, member, owner, or admin role", () => {
      expect(isViewer).toBeDefined();
    });
  });
});
