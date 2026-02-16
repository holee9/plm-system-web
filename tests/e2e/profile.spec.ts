// E2E tests for SPEC-PLM-002 user profile management
// Tests for profile update, password change

import { test, expect } from "@playwright/test";

test.describe("User Profile E2E (SPEC-PLM-002)", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Test123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test.describe("Profile update", () => {
    test("should display profile page", async ({ page }) => {
      await page.goto("/settings/profile");

      // Should show profile form
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
    });

    test("should update user name", async ({ page }) => {
      await page.goto("/settings/profile");

      await page.fill('input[name="name"]', "Updated Name");
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=프로필이 업데이트되었습니다')).toBeVisible();
    });

    test("should update user avatar", async ({ page }) => {
      await page.goto("/settings/profile");

      // Upload avatar image
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles("tests/fixtures/avatar.jpg");

      await page.click('button[type="submit"]');

      // Should show success message and updated avatar
      await expect(page.locator('text=프로필이 업데이트되었습니다')).toBeVisible();
    });

    test("should validate name length", async ({ page }) => {
      await page.goto("/settings/profile");

      await page.fill('input[name="name"]', "A"); // Too short
      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('text=이름은 최소 2자 이상')).toBeVisible();
    });
  });

  test.describe("Password change", () => {
    test("should show password change form", async ({ page }) => {
      await page.goto("/settings/profile");

      // Scroll to password change section
      await page.click('text=비밀번호 변경');

      // Should show password change inputs
      await expect(page.locator('input[name="currentPassword"]')).toBeVisible();
      await expect(page.locator('input[name="newPassword"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    });

    test("should change password with valid current password", async ({ page }) => {
      await page.goto("/settings/profile");
      await page.click('text=비밀번호 변경');

      await page.fill('input[name="currentPassword"]', "Test123!");
      await page.fill('input[name="newPassword"]', "NewTest123!");
      await page.fill('input[name="confirmPassword"]', "NewTest123!");
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=비밀번호가 변경되었습니다')).toBeVisible();

      // Should redirect to login after password change
      await expect(page).toHaveURL("/login");
    });

    test("should reject wrong current password", async ({ page }) => {
      await page.goto("/settings/profile");
      await page.click('text=비밀번호 변경');

      await page.fill('input[name="currentPassword"]', "WrongPassword123!");
      await page.fill('input[name="newPassword"]', "NewTest123!");
      await page.fill('input[name="confirmPassword"]', "NewTest123!");
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=현재 비밀번호가 올바르지 않습니다')).toBeVisible();
    });

    test("should reject if new password is same as current", async ({ page }) => {
      await page.goto("/settings/profile");
      await page.click('text=비밀번호 변경');

      await page.fill('input[name="currentPassword"]', "Test123!");
      await page.fill('input[name="newPassword"]', "Test123!");
      await page.fill('input[name="confirmPassword"]', "Test123!");
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=새 비밀번호는 현재 비밀번호와 달라야 합니다')).toBeVisible();
    });

    it("should reject if password confirmation does not match", async ({ page }) => {
      await page.goto("/settings/profile");
      await page.click('text=비밀번호 변경');

      await page.fill('input[name="currentPassword"]', "Test123!");
      await page.fill('input[name="newPassword"]', "NewTest123!");
      await page.fill('input[name="confirmPassword"]', "Different123!");
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=비밀번호가 일치하지 않습니다')).toBeVisible();
    });

    test("should validate new password complexity", async ({ page }) => {
      await page.goto("/settings/profile");
      await page.click('text=비밀번호 변경');

      await page.fill('input[name="currentPassword"]', "Test123!");
      await page.fill('input[name="newPassword"]', "weak");
      await page.fill('input[name="confirmPassword"]', "weak");
      await page.click('button[type="submit"]');

      // Should show complexity error
      await expect(page.locator('text=비밀번호는 최소 8자 이상')).toBeVisible();
    });
  });
});
