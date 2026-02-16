// E2E tests for SPEC-PLM-002 authentication flow
// Tests for register, login, logout, password reset flows

import { test, expect } from "@playwright/test";

test.describe("Authentication Flow E2E (SPEC-PLM-002)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL
    await page.goto("/");
  });

  test.describe("AC-001: Registration creates user and allows login", () => {
    test("should register new user with valid credentials", async ({ page }) => {
      await page.goto("/register");

      // Fill registration form
      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "Test123!");

      // Submit form
      await page.click('button[type="submit"]');

      // Should show success message or redirect
      await expect(page.locator("text=회원가입이 완료")).toBeVisible({ timeout: 5000 });
    });

    test("should auto-login after registration", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "autologin@example.com");
      await page.fill('input[name="password"]', "Test123!");

      await page.click('button[type="submit"]');

      // Should redirect to dashboard or show logged in state
      await expect(page).toHaveURL(/\/dashboard|\/settings/, { timeout: 5000 });
    });
  });

  test.describe("AC-002: Reject invalid email format", () => {
    test("should show validation error for invalid email", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[name="email"]', "invalid-email");
      await page.fill('input[name="password"]', "Test123!");
      await page.fill('input[name="name"]', "Test User");

      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('text=올바른 이메일 주소를 입력해주세요')).toBeVisible();
    });
  });

  test.describe("AC-003: Reject duplicate email", () => {
    test("should show error for existing email", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[name="email"]', "existing@example.com");
      await page.fill('input[name="password"]', "Test123!");
      await page.fill('input[name="name"]', "Test User");

      await page.click('button[type="submit"]');

      // Should show duplicate email error
      await expect(page.locator('text=이미 등록된 이메일')).toBeVisible();
    });
  });

  test.describe("AC-004: Valid login creates session", () => {
    test("should login with valid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "Test123!");

      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL("/dashboard", { timeout: 5000 });
    });

    test("should create session on login", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "Test123!");

      await page.click('button[type="submit"]');

      // Check for access token cookie
      const cookies = await page.context().cookies();
      const accessToken = cookies.find((c) => c.name === "access_token");
      const refreshToken = cookies.find((c) => c.name === "refresh_token");

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    });
  });

  test.describe("AC-005: Reject wrong password", () => {
    test("should show error for wrong password", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "WrongPassword123!");

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
    });
  });

  test.describe("AC-006: Logout deletes session", () => {
    test("should logout and redirect to login", async ({ page, context }) => {
      // First login
      await page.goto("/login");
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "Test123!");
      await page.click('button[type="submit"]');

      await page.waitForURL("/dashboard");

      // Then logout
      await page.click('button[aria-label="user-menu"]');
      await page.click('text=로그아웃');

      // Should redirect to login
      await expect(page).toHaveURL("/login");

      // Cookies should be cleared
      const cookies = await context.cookies();
      const accessToken = cookies.find((c) => c.name === "access_token");
      const refreshToken = cookies.find((c) => c.name === "refresh_token");

      expect(accessToken).toBeUndefined();
      expect(refreshToken).toBeUndefined();
    });
  });

  test.describe("AC-007: Protected page requires login", () => {
    test("should redirect to login when accessing protected page", async ({ page }) => {
      await page.goto("/settings/profile");

      // Should redirect to login
      await expect(page).toHaveURL("/login");
    });

    test("should store redirect path and redirect after login", async ({ page }) => {
      // Try to access protected page
      await page.goto("/settings/profile");

      // Login
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "Test123!");
      await page.click('button[type="submit"]');

      // Should redirect back to protected page
      await expect(page).toHaveURL("/settings/profile");
    });
  });

  test.describe("AC-010: Rate limiting", () => {
    test("should show rate limit error after too many attempts", async ({ page }) => {
      await page.goto("/login");

      // Attempt login with wrong password 6 times (exceeds limit of 5)
      for (let i = 0; i < 6; i++) {
        await page.fill('input[name="email"]', "ratelimit@example.com");
        await page.fill('input[name="password"]', "WrongPassword123!");
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100);
      }

      // Should show rate limit or account locked message
      await expect(page.locator('text=계정이 잠겨 있습니다|로그인 시도가 너무 많습니다')).toBeVisible();
    });
  });

  test.describe("Password reset flow", () => {
    test("should request password reset", async ({ page }) => {
      await page.goto("/forgot-password");

      await page.fill('input[name="email"]', "test@example.com");
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=비밀번호 재설정 링크가 발송')).toBeVisible();
    });

    test("should show same message for non-existent email (security)", async ({ page }) => {
      await page.goto("/forgot-password");

      await page.fill('input[name="email"]', "nonexistent@example.com");
      await page.click('button[type="submit"]');

      // Should still show success message (no user enumeration)
      await expect(page.locator('text=해당 이메일로 계정이 존재하면')).toBeVisible();
    });

    test("should reset password with valid token", async ({ page }) => {
      // Go to reset page with token (simulated)
      await page.goto("/reset-password?token=valid-token");

      await page.fill('input[name="newPassword"]', "NewPassword123!");
      await page.fill('input[name="confirmPassword"]', "NewPassword123!");
      await page.click('button[type="submit"]');

      // Should redirect to login after successful reset
      await expect(page).toHaveURL("/login");
      await expect(page.locator('text=비밀번호가 재설정되었습니다')).toBeVisible();
    });
  });

  test.describe("NFR-003: Secure cookie attributes", () => {
    test("should set httpOnly cookies", async ({ page, context }) => {
      await page.goto("/login");
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "Test123!");
      await page.click('button[type="submit"]');

      await page.waitForURL("/dashboard");

      const cookies = await context.cookies();
      const accessToken = cookies.find((c) => c.name === "access_token");

      expect(accessToken?.httpOnly).toBe(true);
      expect(accessToken?.secure).toBe(true);
      expect(accessToken?.sameSite).toBe("Lax");
    });
  });

  test.describe("NFR-004: Password complexity", () => {
    test("should show error for weak password", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "weakpass@example.com");
      await page.fill('input[name="password"]', "weak");

      await page.click('button[type="submit"]');

      // Should show password complexity error
      await expect(page.locator('text=비밀번호는 최소 8자 이상이어야 합니다')).toBeVisible();
    });

    test("should show error for password without 3 character types", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "notcomplex@example.com");
      await page.fill('input[name="password"]', "abcdefgh1234"); // Missing uppercase

      await page.click('button[type="submit"]');

      // Should show complexity error
      await expect(page.locator('text=3가지 이상을 포함해야 합니다')).toBeVisible();
    });
  });
});
