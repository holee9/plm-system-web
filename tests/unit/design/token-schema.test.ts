/**
 * Specification tests for design token schema
 *
 * These tests verify that the design token JSON schema is properly structured
 * and follows the defined naming conventions and token categories.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const designDir = join(process.cwd(), ".design");

describe("Design Token Schema", () => {
  describe("Token categories", () => {
    it("should define colors token category", () => {
      const tokensPath = join(designDir, "tokens", "colors.json");
      expect(existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
      expect(tokens).toHaveProperty("colors");
    });

    it("should define typography token category", () => {
      const tokensPath = join(designDir, "tokens", "typography.json");
      expect(existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
      expect(tokens).toHaveProperty("typography");
    });

    it("should define spacing token category", () => {
      const tokensPath = join(designDir, "tokens", "spacing.json");
      expect(existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
      expect(tokens).toHaveProperty("spacing");
    });

    it("should define borderRadius token category", () => {
      const tokensPath = join(designDir, "tokens", "border-radius.json");
      expect(existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
      expect(tokens).toHaveProperty("borderRadius");
    });

    it("should define shadows token category", () => {
      const tokensPath = join(designDir, "tokens", "shadows.json");
      expect(existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
      expect(tokens).toHaveProperty("shadows");
    });

    it("should define animation token category", () => {
      const tokensPath = join(designDir, "tokens", "animation.json");
      expect(existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
      expect(tokens).toHaveProperty("animation");
    });

    it("should define breakpoints token category", () => {
      const tokensPath = join(designDir, "tokens", "breakpoints.json");
      expect(existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
      expect(tokens).toHaveProperty("breakpoints");
    });

    it("should define zIndex token category", () => {
      const tokensPath = join(designDir, "tokens", "z-index.json");
      expect(existsSync(tokensPath)).toBe(true);

      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
      expect(tokens).toHaveProperty("zIndex");
    });
  });

  describe("Theme support", () => {
    it("colors should support light and dark themes", () => {
      const tokensPath = join(designDir, "tokens", "colors.json");
      const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));

      expect(tokens.colors).toHaveProperty("light");
      expect(tokens.colors).toHaveProperty("dark");
    });
  });

  describe("Naming convention", () => {
    it("should use camelCase or Tailwind-style naming for token names", () => {
      const spacingPath = join(designDir, "tokens", "spacing.json");
      const spacing = JSON.parse(readFileSync(spacingPath, "utf-8"));

      const tokenNames = Object.keys(spacing.spacing);
      tokenNames.forEach((name) => {
        // Allow camelCase or Tailwind-style with numeric prefix (e.g., 2xl, 3xl)
        expect(name).toMatch(/^[a-z][a-zA-Z0-9]*$|^\d+[a-zA-Z]+$/);
      });
    });
  });

  describe("Token metadata", () => {
    it("should include token metadata", () => {
      const colorsPath = join(designDir, "tokens", "colors.json");
      const colors = JSON.parse(readFileSync(colorsPath, "utf-8"));

      expect(colors).toHaveProperty("$schema");
      expect(colors).toHaveProperty("name");
      expect(colors).toHaveProperty("version");
      expect(colors).toHaveProperty("description");
    });
  });
});
