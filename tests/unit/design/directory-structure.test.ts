/**
 * Specification tests for design directory structure
 *
 * These tests verify that the .design directory structure is properly set up
 * to serve as the single source of truth for design tokens.
 */

import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const designDir = join(process.cwd(), ".design");

describe("Design Directory Structure", () => {
  describe(".design root directory", () => {
    it("should exist", () => {
      expect(existsSync(designDir)).toBe(true);
    });

    it("should be a directory", () => {
      const stat = statSync(designDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it("should contain required subdirectories", () => {
      const contents = readdirSync(designDir);
      expect(contents).toContain("tokens");
      expect(contents).toContain("components");
      expect(contents).toContain("docs");
    });
  });

  describe(".design/tokens directory", () => {
    const tokensDir = join(designDir, "tokens");

    it("should exist", () => {
      expect(existsSync(tokensDir)).toBe(true);
    });

    it("should contain token categories", () => {
      const contents = readdirSync(tokensDir);
      expect(contents.length).toBeGreaterThan(0);
    });
  });

  describe(".design/components directory", () => {
    const componentsDir = join(designDir, "components");

    it("should exist", () => {
      expect(existsSync(componentsDir)).toBe(true);
    });
  });

  describe(".design/docs directory", () => {
    const docsDir = join(designDir, "docs");

    it("should exist", () => {
      expect(existsSync(docsDir)).toBe(true);
    });
  });
});
