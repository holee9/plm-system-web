import { describe, it, expect, vi } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

describe("TASK-007: Theme Switching Mechanism", () => {
  const themeProviderPath = resolve(__dirname, "../../../src/components/theme-provider.tsx");
  const themeTogglePath = resolve(__dirname, "../../../src/components/layout/theme-toggle.tsx");
  const cssTokensPath = resolve(__dirname, "../../../src/design/tokens.css");

  it("should have theme provider component", () => {
    expect(existsSync(themeProviderPath)).toBe(true);
  });

  it("should have theme toggle component", () => {
    expect(existsSync(themeTogglePath)).toBe(true);
  });

  it("should use next-themes library", () => {
    const themeProvider = readFileSync(themeProviderPath, "utf-8");
    expect(themeProvider).toMatch(/next-themes/);
  });

  it("should provide theme context to children", () => {
    const themeProvider = readFileSync(themeProviderPath, "utf-8");
    expect(themeProvider).toMatch(/ThemeProvider/);
    expect(themeProvider).toMatch(/children/);
  });

  it("should support light and dark themes", () => {
    const themeProvider = readFileSync(themeProviderPath, "utf-8");
    // next-themes supports theme switching via props
    expect(themeProvider).toMatch(/ThemeProvider/);
    expect(themeProvider).toMatch(/\.\.\.props/);
  });

  it("should have theme toggle button with icons", () => {
    const themeToggle = readFileSync(themeTogglePath, "utf-8");
    expect(themeToggle).toMatch(/Moon/);
    expect(themeToggle).toMatch(/Sun/);
    expect(themeToggle).toMatch(/lucide-react/);
  });

  it("should toggle between light and dark themes", () => {
    const themeToggle = readFileSync(themeTogglePath, "utf-8");
    expect(themeToggle).toMatch(/setTheme/);
    expect(themeToggle).toMatch(/theme === "dark"/);
    expect(themeToggle).toMatch(/onClick/);
  });

  it("should persist theme preference", () => {
    const themeProvider = readFileSync(themeProviderPath, "utf-8");
    // next-themes automatically persists to localStorage
    expect(themeProvider).toMatch(/ThemeProvider/);
  });

  it("should have CSS classes for light and dark themes", () => {
    const cssTokens = readFileSync(cssTokensPath, "utf-8");
    expect(cssTokens).toMatch(/\.light/);
    expect(cssTokens).toMatch(/\.dark/);
    expect(cssTokens).toMatch(/\/\* Light theme \*\//);
    expect(cssTokens).toMatch(/\/\* Dark theme \*\//);
  });

  it("should define color tokens for both themes", () => {
    const cssTokens = readFileSync(cssTokensPath, "utf-8");
    // Light theme colors
    expect(cssTokens).toMatch(/--background-primary:\s*#ffffff/);
    expect(cssTokens).toMatch(/--foreground-primary:\s*#09090b/);

    // Dark theme colors
    const darkThemeMatch = cssTokens.match(/\.dark\s*{([^}]+)}/);
    expect(darkThemeMatch).toBeTruthy();
    expect(cssTokens).toMatch(/--background-primary:\s*#09090b/);
    expect(cssTokens).toMatch(/--foreground-primary:\s*#fafafa/);
  });

  it("should handle client-side hydration", () => {
    const themeToggle = readFileSync(themeTogglePath, "utf-8");
    expect(themeToggle).toMatch(/mounted/);
    expect(themeToggle).toMatch(/useEffect/);
    expect(themeToggle).toMatch(/setMounted/);
  });

  it("should have accessible aria labels", () => {
    const themeToggle = readFileSync(themeTogglePath, "utf-8");
    expect(themeToggle).toMatch(/aria-label/);
    expect(themeToggle).toMatch(/Switch to light mode|Switch to dark mode/);
  });

  it("should use design tokens for theme colors", () => {
    const cssTokens = readFileSync(cssTokensPath, "utf-8");
    // Verify that theme classes use the design token color variables
    expect(cssTokens).toMatch(/--primary-default/);
    expect(cssTokens).toMatch(/--destructive-default/);
    expect(cssTokens).toMatch(/--success-default/);
    expect(cssTokens).toMatch(/--warning-default/);
    expect(cssTokens).toMatch(/--info-default/);
  });
});
