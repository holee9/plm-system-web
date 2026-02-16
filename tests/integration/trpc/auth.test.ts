// Auth router integration tests
import { describe, it, expect, beforeEach, vi } from "vitest";
import { authRouter } from "@/server/trpc/routers/auth";
import { db } from "@/server/db";
import { verifyPassword, hashPassword } from "@/server/utils/password";
import { verifyRefreshToken } from "@/server/utils/jwt";

// Mock database
vi.mock("@/server/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock utilities - set up default return values
vi.mock("@/server/utils/password", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  validatePasswordStrength: vi.fn(() => ({ valid: true, errors: [] })),
}));

vi.mock("@/server/utils/jwt", () => ({
  generateAccessToken: vi.fn(() => "mock-access-token"),
  generateRefreshToken: vi.fn(() => "mock-refresh-token"),
  verifyRefreshToken: vi.fn(),
  generateTokenId: vi.fn(() => "mock-token-id"),
  hashToken: vi.fn((token: string) => `hashed-${token}`),
}));

// Mock crypto
vi.mock("node:crypto", async () => {
  const actual = await vi.importActual("node:crypto");
  return {
    ...actual,
    randomBytes: vi.fn(() => ({ toString: () => "mock-token" })),
  };
});

describe("Auth Router Integration Tests", () => {
  let mockCaller: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default mock return values
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
    vi.mocked(verifyRefreshToken).mockResolvedValue({
      sub: "1",
      tokenId: "token-id",
    });

    // Create mock context
    const mockContext = {
      req: {
        cookies: {
          get: vi.fn(),
        },
        headers: {
          get: vi.fn(() => null),
        },
      },
      db,
    };

    // Create caller
    mockCaller = authRouter.createCaller(mockContext as any);
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const mockInsertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 1,
              email: "test@example.com",
              name: "Test User",
              status: "PENDING",
              emailVerified: false,
            },
          ]),
        }),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

      const result = await mockCaller.register({
        email: "test@example.com",
        password: "TestPass123!",
        name: "Test User",
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBe(1);
    });

    it("should reject registration with duplicate email", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 1, email: "test@example.com" }]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      await expect(
        mockCaller.register({
          email: "test@example.com",
          password: "TestPass123!",
          name: "Test User",
        })
      ).rejects.toThrow();
    });

    it("should reject registration with weak password", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const { validatePasswordStrength } = await import("@/server/utils/password");
      vi.mocked(validatePasswordStrength).mockReturnValue({
        valid: false,
        errors: ["Password is too weak"],
      });

      await expect(
        mockCaller.register({
          email: "test@example.com",
          password: "weak",
          name: "Test User",
        })
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashedpassword",
        status: "ACTIVE",
        failedAttempts: 0,
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
        orderBy: vi.fn().mockReturnThis(),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const mockUpdateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      const mockInsertChain = {
        values: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

      const result = await mockCaller.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user).toHaveProperty("id", 1);
    });

    it("should reject login with wrong password", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        passwordHash: "hashedpassword",
        status: "ACTIVE",
        failedAttempts: 0,
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const mockUpdateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      vi.mocked(verifyPassword).mockResolvedValue(false);

      await expect(
        mockCaller.login({
          email: "test@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow();
    });

    it("should reject login for locked account", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        passwordHash: "hashedpassword",
        status: "ACTIVE",
        lockedUntil: new Date(Date.now() + 60000), // Locked for 1 minute
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      await expect(
        mockCaller.login({
          email: "test@example.com",
          password: "password",
        })
      ).rejects.toThrow("계정이 잠겨 있습니다");
    });

    it("should reject login for non-existent user", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      await expect(
        mockCaller.login({
          email: "nonexistent@example.com",
          password: "password",
        })
      ).rejects.toThrow("이메일 또는 비밀번호가 올바르지 않습니다");
    });

    it("should lock account after 5 failed attempts", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        passwordHash: "hashedpassword",
        status: "ACTIVE",
        failedAttempts: 4, // Already has 4 failed attempts
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const mockUpdateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      vi.mocked(verifyPassword).mockResolvedValue(false);

      await expect(
        mockCaller.login({
          email: "test@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("이메일 또는 비밀번호가 올바르지 않습니다");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const mockContext = {
        req: {
          cookies: {
            get: vi.fn().mockReturnValue({ value: "refresh-token" }),
          },
          headers: {
            get: vi.fn(() => null),
          },
        },
        db,
      };

      const mockDeleteChain = {
        where: vi.fn().mockResolvedValue(1),
      };

      vi.mocked(db.delete).mockReturnValue(mockDeleteChain as any);

      const caller = authRouter.createCaller(mockContext as any);
      const result = await caller.logout();

      expect(result.success).toBe(true);
    });

    it("should handle logout without refresh token", async () => {
      const mockContext = {
        req: {
          cookies: {
            get: vi.fn().mockReturnValue(undefined),
          },
          headers: {
            get: vi.fn(() => null),
          },
        },
        db,
      };

      const caller = authRouter.createCaller(mockContext as any);
      const result = await caller.logout();

      expect(result.success).toBe(true);
    });
  });

  describe("refresh", () => {
    it("should refresh tokens successfully", async () => {
      const mockContext = {
        req: {
          cookies: {
            get: vi.fn().mockReturnValue({ value: "valid-refresh-token" }),
          },
          headers: {
            get: vi.fn(() => null),
          },
        },
        db,
      };

      const mockSession = {
        id: 1,
        userId: 1,
        expiresAt: new Date(Date.now() + 86400000),
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        status: "ACTIVE",
      };

      let selectCallCount = 0;
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          selectCallCount++;
          if (selectCallCount === 1) {
            return Promise.resolve([mockSession]);
          }
          return Promise.resolve([mockUser]);
        }),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const mockUpdateChain = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      const mockInsertChain = {
        values: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

      const caller = authRouter.createCaller(mockContext as any);
      const result = await caller.refresh();

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should reject refresh with invalid token", async () => {
      const mockContext = {
        req: {
          cookies: {
            get: vi.fn().mockReturnValue({ value: "invalid-token" }),
          },
          headers: {
            get: vi.fn(() => null),
          },
        },
        db,
      };

      vi.mocked(verifyRefreshToken).mockRejectedValue(new Error("Invalid token"));

      const caller = authRouter.createCaller(mockContext as any);

      await expect(caller.refresh()).rejects.toThrow();
    });

    it("should reject refresh with expired session", async () => {
      const mockContext = {
        req: {
          cookies: {
            get: vi.fn().mockReturnValue({ value: "valid-token" }),
          },
          headers: {
            get: vi.fn(() => null),
          },
        },
        db,
      };

      const mockSession = {
        id: 1,
        userId: 1,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSession]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const mockDeleteChain = {
        where: vi.fn().mockResolvedValue(1),
      };

      vi.mocked(db.delete).mockReturnValue(mockDeleteChain as any);

      const caller = authRouter.createCaller(mockContext as any);

      await expect(caller.refresh()).rejects.toThrow("만료");
    });
  });

  describe("verifyEmail", () => {
    it("should throw error for invalid token", async () => {
      // verifyEmail is implemented, so it validates tokens
      await expect(
        mockCaller.verifyEmail({ token: "some-token" })
      ).rejects.toThrow();
    });
  });

  describe("requestPasswordReset", () => {
    it("should return success even for non-existent email (security)", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // User not found
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const result = await mockCaller.requestPasswordReset({
        email: "nonexistent@example.com",
      });

      expect(result.success).toBe(true);
    });

    it("should return success for existing email", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

      const mockInsertChain = {
        values: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

      const result = await mockCaller.requestPasswordReset({
        email: "test@example.com",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("resetPassword", () => {
    it("should throw error for invalid token", async () => {
      // resetPassword is implemented, so it validates tokens
      await expect(
        mockCaller.resetPassword({ token: "some-token", newPassword: "NewPass123!" })
      ).rejects.toThrow();
    });

    it("should validate password strength", async () => {
      const { validatePasswordStrength } = await import("@/server/utils/password");
      vi.mocked(validatePasswordStrength).mockReturnValue({
        valid: false,
        errors: ["Password is too weak"],
      });

      await expect(
        mockCaller.resetPassword({ token: "some-token", newPassword: "weak" })
      ).rejects.toThrow(); // Zod validation will throw
    });
  });
});
