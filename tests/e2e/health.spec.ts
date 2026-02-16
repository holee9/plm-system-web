import { test, expect } from "@playwright/test";

test.describe("Health Check", () => {
  test("should return status ok", async ({ request }) => {
    const response = await request.get("/api/trpc/health.check");

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.result.data).toHaveProperty("status", "ok");
    expect(data.result.data).toHaveProperty("timestamp");
  });
});

test.describe("Home Page", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Welcome to PLM System Web");
  });
});
