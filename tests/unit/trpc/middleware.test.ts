// tRPC middleware tests
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { isAuthed, type AuthenticatedUser } from "@/server/trpc/middleware/is-authed";
import { authorized } from "@/server/trpc/middleware/authorization";
import { verifyAccessToken } from "@/server/utils/jwt";
import type { Context } from "@/server/trpc/context";

// Mock JWT verification
vi.mock("@/server/utils/jwt", () => ({
  verifyAccessToken: vi.fn(),
}));

describe("Authentication Middleware (isAuthed)", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    roles: ["viewer"],
  };

  const createMockContext = (): Context => ({
    req: {
      cookies: {
        get: vi.fn(),
      },
      headers: {
        get: vi.fn(() => null),
      },
    },
    db: {
      select: vi.fn(),
    } as any,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow authenticated user", async () => {
    const mockContext = createMockContext();
    const mockPayload = {
      sub: "1",
      email: "test@example.com",
      roles: ["viewer"],
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 900,
    };

    vi.mocked(verifyAccessToken).mockResolvedValue(mockPayload as any);

    // Mock the database select chain properly
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          status: "ACTIVE",
          roleName: "viewer",
        },
      ]),
    };

    vi.mocked(mockContext.db.select).mockReturnValue(mockSelectChain as any);

    mockContext.req.cookies.get = vi.fn().mockReturnValue({
      value: "valid-access-token",
    });

    // Mock next to return a value and capture what it was called with
    let capturedContext: any;
    const next = vi.fn().mockImplementation(({ ctx }) => {
      capturedContext = ctx;
      return Promise.resolve({ result: "success" });
    });

    const result = await isAuthed({ ctx: mockContext as any, next });

    expect(next).toHaveBeenCalled();
    expect(capturedContext.user).toBeDefined();
    expect(capturedContext.user.email).toBe("test@example.com");
    expect(result).toEqual({ result: "success" });
  });

  it("should reject request without access token", async () => {
    const mockContext = createMockContext();
    mockContext.req.cookies.get = vi.fn().mockReturnValue(undefined);

    const next = vi.fn().mockResolvedValue({ result: "success" });

    await expect(isAuthed({ ctx: mockContext as any, next })).rejects.toThrow(TRPCError);
    await expect(isAuthed({ ctx: mockContext as any, next })).rejects.toThrow("액세스 토큰이 필요합니다");
  });

  it("should reject invalid access token", async () => {
    const mockContext = createMockContext();
    vi.mocked(verifyAccessToken).mockRejectedValue(new Error("Invalid token"));

    mockContext.req.cookies.get = vi.fn().mockReturnValue({
      value: "invalid-token",
    });

    const next = vi.fn().mockResolvedValue({ result: "success" });

    await expect(isAuthed({ ctx: mockContext as any, next })).rejects.toThrow("유효하지 않거나 만료된 액세스 토큰입니다");
  });

  it("should reject inactive user", async () => {
    const mockContext = createMockContext();
    const mockPayload = {
      sub: "1",
      email: "test@example.com",
      roles: ["viewer"],
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 900,
    };

    vi.mocked(verifyAccessToken).mockResolvedValue(mockPayload as any);

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          status: "PENDING", // Not active
          roleName: null,
        },
      ]),
    };

    vi.mocked(mockContext.db.select).mockReturnValue(mockSelectChain as any);

    mockContext.req.cookies.get = vi.fn().mockReturnValue({
      value: "valid-token",
    });

    const next = vi.fn().mockResolvedValue({ result: "success" });

    await expect(isAuthed({ ctx: mockContext as any, next })).rejects.toThrow("pending");
  });

  it("should reject if user not found", async () => {
    const mockContext = createMockContext();
    const mockPayload = {
      sub: "999",
      email: "nonexistent@example.com",
      roles: ["viewer"],
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 900,
    };

    vi.mocked(verifyAccessToken).mockResolvedValue(mockPayload as any);

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]), // User not found
    };

    vi.mocked(mockContext.db.select).mockReturnValue(mockSelectChain as any);

    mockContext.req.cookies.get = vi.fn().mockReturnValue({
      value: "valid-token",
    });

    const next = vi.fn().mockResolvedValue({ result: "success" });

    await expect(isAuthed({ ctx: mockContext as any, next })).rejects.toThrow("사용자를 찾을 수 없습니다");
  });
});

describe("Authorization Middleware (authorized)", () => {
  const createMockAuthContext = (roles: string[] = []) => ({
    user: {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      roles,
    },
  });

  const createMockContextWithoutUser = () => ({
    req: {
      cookies: { get: vi.fn() },
      headers: { get: vi.fn() },
    },
    db: {} as any,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow user with required role", async () => {
    const adminAuth = authorized(["admin"]);
    const adminContext = createMockAuthContext(["admin"]);

    const next = vi.fn().mockResolvedValue({ result: "success" });

    const result = await adminAuth({ ctx: adminContext as any, next });

    expect(next).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("should allow user with one of multiple required roles", async () => {
    const multiAuth = authorized(["admin", "owner"]);
    const ownerContext = createMockAuthContext(["owner"]);

    const next = vi.fn().mockResolvedValue({ result: "success" });

    const result = await multiAuth({ ctx: ownerContext as any, next });

    expect(next).toHaveBeenCalled();
  });

  it("should reject user without required role", async () => {
    const adminAuth = authorized(["admin"]);
    const viewerContext = createMockAuthContext(["viewer"]);

    const next = vi.fn().mockResolvedValue({ result: "success" });

    try {
      await adminAuth({ ctx: viewerContext as any, next });
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should reject request without user context", async () => {
    const adminAuth = authorized(["admin"]);
    const next = vi.fn().mockResolvedValue({ result: "success" });

    try {
      await adminAuth({ ctx: createMockContextWithoutUser() as any, next });
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should reject user with no roles", async () => {
    const adminAuth = authorized(["admin"]);
    const noRolesContext = createMockAuthContext([]);

    const next = vi.fn().mockResolvedValue({ result: "success" });

    try {
      await adminAuth({ ctx: noRolesContext as any, next });
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should handle user with multiple roles", async () => {
    const memberAuth = authorized(["member"]);
    const multiRoleContext = createMockAuthContext(["viewer", "member", "admin"]);

    const next = vi.fn().mockResolvedValue({ result: "success" });

    const result = await memberAuth({ ctx: multiRoleContext as any, next });

    expect(next).toHaveBeenCalled();
  });

  it("should include required roles in error message", async () => {
    const specificAuth = authorized(["admin", "moderator"]);
    const viewerContext = createMockAuthContext(["viewer"]);

    const next = vi.fn().mockResolvedValue({ result: "success" });

    try {
      await specificAuth({ ctx: viewerContext as any, next });
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toContain("admin");
      expect(error.message).toContain("moderator");
    }
  });
});

describe("Pre-configured Authorization Middlewares", () => {
  it("isAdmin should require admin role", async () => {
    const { isAdmin } = await import("@/server/trpc/middleware/authorization");

    const adminContext = {
      user: { roles: ["admin"] },
    };

    const viewerContext = {
      user: { roles: ["viewer"] },
    };

    const next = vi.fn().mockResolvedValue({ result: "success" });

    // Should allow admin
    await expect(isAdmin({ ctx: adminContext as any, next })).resolves.toBeDefined();

    // Should reject non-admin
    await expect(isAdmin({ ctx: viewerContext as any, next })).rejects.toThrow();
  });

  it("isOwner should require owner or admin role", async () => {
    const { isOwner } = await import("@/server/trpc/middleware/authorization");

    const ownerContext = {
      user: { roles: ["owner"] },
    };

    const adminContext = {
      user: { roles: ["admin"] },
    };

    const viewerContext = {
      user: { roles: ["viewer"] },
    };

    const next = vi.fn().mockResolvedValue({ result: "success" });

    // Should allow owner
    await expect(isOwner({ ctx: ownerContext as any, next })).resolves.toBeDefined();

    // Should allow admin
    await expect(isOwner({ ctx: adminContext as any, next })).resolves.toBeDefined();

    // Should reject non-owner, non-admin
    await expect(isOwner({ ctx: viewerContext as any, next })).rejects.toThrow();
  });

  it("isMember should require member, owner, or admin role", async () => {
    const { isMember } = await import("@/server/trpc/middleware/authorization");

    const memberContext = {
      user: { roles: ["member"] },
    };

    const viewerContext = {
      user: { roles: ["viewer"] },
    };

    const next = vi.fn().mockResolvedValue({ result: "success" });

    // Should allow member
    await expect(isMember({ ctx: memberContext as any, next })).resolves.toBeDefined();

    // Should reject viewer only
    await expect(isMember({ ctx: viewerContext as any, next })).rejects.toThrow();
  });

  it("isViewer should allow any authenticated user", async () => {
    const { isViewer } = await import("@/server/trpc/middleware/authorization");

    const viewerContext = {
      user: { roles: ["viewer"] },
    };

    const memberContext = {
      user: { roles: ["member"] },
    };

    const next = vi.fn().mockResolvedValue({ result: "success" });

    // Should allow viewer
    await expect(isViewer({ ctx: viewerContext as any, next })).resolves.toBeDefined();

    // Should allow member
    await expect(isViewer({ ctx: memberContext as any, next })).resolves.toBeDefined();
  });
});
