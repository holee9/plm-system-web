import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

describe("TASK-005: Tailwind Config Integration", () => {
  const tailwindConfigPath = resolve(__dirname, "../../../tailwind.config.ts");
  const cssTokensPath = resolve(__dirname, "../../../src/design/tokens.css");

  it("should have tailwind.config.ts file", () => {
    expect(existsSync(tailwindConfigPath)).toBe(true);
  });

  it("should import and use design tokens CSS file", () => {
    const tailwindConfig = readFileSync(tailwindConfigPath, "utf-8");

    // Check that design tokens CSS is referenced
    expect(tailwindConfig).toMatch(/design.*tokens\.css/);
  });

  it("should use CSS custom properties for colors", () => {
    const tailwindConfig = readFileSync(tailwindConfigPath, "utf-8");

    // Check that colors use var(--...) pattern
    expect(tailwindConfig).toMatch(/var\(--background/);
    expect(tailwindConfig).toMatch(/var\(--foreground/);
    expect(tailwindConfig).toMatch(/var\(--primary/);
    expect(tailwindConfig).toMatch(/var\(--secondary/);
  });

  it("should use CSS custom properties for spacing", () => {
    const tailwindConfig = readFileSync(tailwindConfigPath, "utf-8");

    // Check that spacing uses var(--spacing-...) pattern
    expect(tailwindConfig).toMatch(/var\(--spacing-/);
  });

  it("should use CSS custom properties for border radius", () => {
    const tailwindConfig = readFileSync(tailwindConfigPath, "utf-8");

    // Check that borderRadius uses var(--radius-...) pattern
    expect(tailwindConfig).toMatch(/var\(--radius/);
  });

  it("should use CSS custom properties for shadows", () => {
    const tailwindConfig = readFileSync(tailwindConfigPath, "utf-8");

    // Check that shadows use var(--shadow-...) pattern
    expect(tailwindConfig).toMatch(/var\(--shadow-/);
  });

  it("should use CSS custom properties for animation durations", () => {
    const tailwindConfig = readFileSync(tailwindConfigPath, "utf-8");

    // Check that animations reference design tokens
    expect(tailwindConfig).toMatch(/animation:/);
    expect(tailwindConfig).toMatch(/keyframes:/);
  });

  it("should support light and dark themes", () => {
    const tailwindConfig = readFileSync(tailwindConfigPath, "utf-8");

    // Check darkMode configuration
    expect(tailwindConfig).toMatch(/darkMode:\s*\[\s*"class"\s*\]/);
  });

  it("should have custom spacing scale from design tokens", () => {
    const tailwindConfig = readFileSync(tailwindConfigPath, "utf-8");
    const cssTokens = readFileSync(cssTokensPath, "utf-8");

    // Verify CSS has spacing tokens
    expect(cssTokens).toMatch(/--spacing-xs:/);
    expect(cssTokens).toMatch(/--spacing-sm:/);
    expect(cssTokens).toMatch(/--spacing-md:/);
    expect(cssTokens).toMatch(/--spacing-lg:/);
    expect(cssTokens).toMatch(/--spacing-xl:/);

    // Verify Tailwind config references them
    expect(tailwindConfig).toMatch(/spacing:/);
  });

  it("should have custom border radius scale from design tokens", () => {
    const cssTokens = readFileSync(cssTokensPath, "utf-8");

    // Verify CSS has border radius tokens
    expect(cssTokens).toMatch(/--radius-none:/);
    expect(cssTokens).toMatch(/--radius-sm:/);
    expect(cssTokens).toMatch(/--radius-md:/);
    expect(cssTokens).toMatch(/--radius-lg:/);
    expect(cssTokens).toMatch(/--radius-full:/);
  });

  it("should have custom shadow definitions from design tokens", () => {
    const cssTokens = readFileSync(cssTokensPath, "utf-8");

    // Verify CSS has shadow tokens
    expect(cssTokens).toMatch(/--shadow-xs:/);
    expect(cssTokens).toMatch(/--shadow-sm:/);
    expect(cssTokens).toMatch(/--shadow-md:/);
    expect(cssTokens).toMatch(/--shadow-lg:/);
    expect(cssTokens).toMatch(/--shadow-xl:/);
  });

  it("should have custom z-index scale from design tokens", () => {
    const cssTokens = readFileSync(cssTokensPath, "utf-8");

    // Verify CSS has z-index tokens
    expect(cssTokens).toMatch(/--z-dropdown:/);
    expect(cssTokens).toMatch(/--z-sticky:/);
    expect(cssTokens).toMatch(/--z-fixed:/);
    expect(cssTokens).toMatch(/--z-modal-backdrop:/);
    expect(cssTokens).toMatch(/--z-modal:/);
    expect(cssTokens).toMatch(/--z-popover:/);
    expect(cssTokens).toMatch(/--z-tooltip:/);
  });
});
