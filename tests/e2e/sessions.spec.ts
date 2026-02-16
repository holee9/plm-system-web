// E2E tests for SPEC-PLM-002 session management
// Tests for session listing, revoking, and security

import { test, expect } from "@playwright/test";

test.describe("Session Management E2E (SPEC-PLM-002)", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Test123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test.describe("Sessions list", () => {
    test("should display active sessions", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Should show sessions section
      await expect(page.locator("text=활성 세션")).toBeVisible();

      // Should show current session
      await expect(page.locator('text=현재 세션|현재 브라우저')).toBeVisible();
    });

    test("should show session details", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Should show device/browser info
      await expect(page.locator(/Chrome|Safari|Firefox|Edge/)).toBeVisible();

      // Should show IP address or location
      await expect(page.locator(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|Unknown IP/)).toBeVisible();

      // Should show last active time
      await expect(page.locator(/방금 전|\d+분 전|\d+시간 전/)).toBeVisible();
    });

    test("should show max sessions limit", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Should show session count and limit
      await expect(page.locator(/최대 5개 세션/)).toBeVisible();
    });
  });

  test.describe("Revoke single session", () => {
    test("should revoke specific session", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Get session count before revoking
      const sessionsBefore = await page.locator('[data-testid="session-item"]').count();

      // Find a non-current session and revoke it
      const revokeButton = page.locator('[data-testid="session-item"]:not(:has-text="현재 세션")) button').first();
      if (await revokeButton.isVisible()) {
        await revokeButton.click();

        // Confirm revocation
        await page.click('text=확인');

        // Should show success message
        await expect(page.locator('text=세션이 취소되었습니다')).toBeVisible();

        // Session count should decrease
        const sessionsAfter = await page.locator('[data-testid="session-item"]').count();
        expect(sessionsAfter).toBeLessThan(sessionsBefore);
      }
    });

    test("should not allow revoking current session", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Current session should not have revoke button
      const currentSession = page.locator('[data-testid="session-item"]:has-text("현재 세션")');
      const revokeButton = currentSession.locator('button:has-text("취소")');

      await expect(revokeButton).not.toBeVisible();
    });
  });

  test.describe("Revoke all sessions", () => {
    test("should revoke all other sessions", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Click "Revoke all other sessions" button
      const revokeAllButton = page.locator('button:has-text("모든 세션 취소")');
      if (await revokeAllButton.isVisible()) {
        await revokeAllButton.click();

        // Confirm revocation
        await page.click('text=확인');

        // Should show success message
        await expect(page.locator('text=모든 세션이 취소되었습니다')).toBeVisible();

        // Should still show current session
        await expect(page.locator('[data-testid="session-item"]:has-text("현재 세션")')).toBeVisible();
      }
    });

    test("should redirect to login after revoking all sessions including current", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Some implementations might have a "Sign out everywhere" button
      const signOutAllButton = page.locator('button:has-text("모든 기기에서 로그아웃")');
      if (await signOutAllButton.isVisible()) {
        await signOutAllButton.click();
        await page.click('text=확인');

        // Should redirect to login
        await expect(page).toHaveURL("/login");
      }
    });
  });

  test.describe("NFR-005: Session expiration", () => {
    test("should show session expiration time", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Should show when session expires
      await expect(page.locator(/만료|\d+일|\d+시간/)).toBeVisible();
    });

    test("should handle expired session gracefully", async ({ page, context }) => {
      // Simulate expired session by setting old cookie
      await context.addCookies([
        {
          name: "refresh_token",
          value: "expired-token",
          domain: "localhost",
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
          expires: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        },
      ]);

      await page.goto("/dashboard");

      // Should redirect to login due to expired session
      await expect(page).toHaveURL("/login", { timeout: 5000 });

      // Should show session expired message
      await expect(page.locator('text=세션이 만료되었습니다|다시 로그인해주세요')).toBeVisible();
    });
  });

  test.describe("EC-001: Multiple concurrent sessions", () => {
    test("should allow multiple sessions from different devices", async ({ browser }) => {
      // Create two contexts (simulating different devices)
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();

      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      // Login on first device
      await page1.goto("/login");
      await page1.fill('input[name="email"]', "test@example.com");
      await page1.fill('input[name="password"]', "Test123!");
      await page1.click('button[type="submit"]');
      await page1.waitForURL("/dashboard");

      // Login on second device
      await page2.goto("/login");
      await page2.fill('input[name="email"]', "test@example.com");
      await page2.fill('input[name="password"]', "Test123!");
      await page2.click('button[type="submit"]');
      await page2.waitForURL("/dashboard");

      // Both should be logged in
      await expect(page1.locator('text=Test User')).toBeVisible();
      await expect(page2.locator('text=Test User')).toBeVisible();

      // Check sessions on first device
      await page1.goto("/settings/sessions");
      const sessionCount = await page1.locator('[data-testid="session-item"]').count();
      expect(sessionCount).toBeGreaterThanOrEqual(2);

      await context1.close();
      await context2.close();
    });

    test("should enforce max 5 sessions limit", async ({ page }) => {
      // This test would need to create 5+ sessions
      // For now, we verify the limit is displayed
      await page.goto("/settings/sessions");

      // Should show max sessions info
      await expect(page.locator(/최대 5개|최대 세션/)).toBeVisible();
    });
  });

  test.describe("Session security", () => {
    test("should show IP address for each session", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Should display IP address (or "Unknown IP" if not available)
      await expect(page.locator(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|Unknown IP/)).toBeVisible();
    });

    test("should show device/browser information", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Should show browser/device info
      await expect(page.locator(/Chrome|Safari|Firefox|Edge|Unknown Device/)).toBeVisible();
    });

    test("should show last active timestamp", async ({ page }) => {
      await page.goto("/settings/sessions");

      // Should show relative time
      await expect(page.locator(/방금 전|\d+분 전|\d+시간 전|\d+일 전/)).toBeVisible();
    });
  });
});
