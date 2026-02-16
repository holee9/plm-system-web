/**
 * Specification tests for CSS custom properties generator
 *
 * These tests verify that CSS custom properties are correctly generated
 * from design token JSON files.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

describe("CSS Custom Properties Generator", () => {
  const cssOutputPath = join(process.cwd(), "src", "design", "tokens.css");

  describe("CSS output file", () => {
    it("should exist", () => {
      expect(existsSync(cssOutputPath)).toBe(true);
    });

    it("should be a valid CSS file", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toContain(":root");
      expect(content).toMatch(/\{[\s\S]*\}/);
    });
  });

  describe("CSS custom properties", () => {
    it("should generate spacing custom properties", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toContain("--spacing-xs");
      expect(content).toContain("--spacing-sm");
      expect(content).toContain("--spacing-md");
      expect(content).toContain("--spacing-lg");
      expect(content).toContain("--spacing-xl");
      expect(content).toContain("--spacing-2xl");
      expect(content).toContain("--spacing-3xl");
    });

    it("should generate border radius custom properties", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toContain("--radius-sm");
      expect(content).toContain("--radius-md");
      expect(content).toContain("--radius-lg");
      expect(content).toContain("--radius-xl");
      expect(content).toContain("--radius-full");
    });

    it("should generate typography custom properties", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toContain("--font-sans");
      expect(content).toContain("--font-mono");
      expect(content).toContain("--text-xs");
      expect(content).toContain("--text-base");
      expect(content).toContain("--font-normal");
      expect(content).toContain("--font-medium");
    });

    it("should generate shadow custom properties", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toContain("--shadow-sm");
      expect(content).toContain("--shadow-md");
      expect(content).toContain("--shadow-lg");
    });

    it("should generate animation custom properties", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toContain("--duration-fast");
      expect(content).toContain("--duration-normal");
      expect(content).toContain("--ease-default");
    });

    it("should generate z-index custom properties", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toContain("--z-dropdown");
      expect(content).toContain("--z-modal");
      expect(content).toContain("--z-tooltip");
    });
  });

  describe("Theme support", () => {
    it("should generate light theme custom properties", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toMatch(/\.light\s*{/);
      expect(content).toContain("--background-primary");
      expect(content).toContain("--foreground-primary");
    });

    it("should generate dark theme custom properties", () => {
      const content = readFileSync(cssOutputPath, "utf-8");
      expect(content).toMatch(/\.dark\s*{/);
      expect(content).toContain("--background-primary");
      expect(content).toContain("--foreground-primary");
    });
  });
});
