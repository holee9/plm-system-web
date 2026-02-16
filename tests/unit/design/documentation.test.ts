import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

describe("TASK-009: Design Token Documentation", () => {
  const docsDir = resolve(__dirname, "../../../.design/docs");
  const usageGuidePath = resolve(docsDir, "usage-guide.md");
  const namingConventionPath = resolve(docsDir, "naming-convention.md");
  const contributionGuidelinesPath = resolve(docsDir, "contribution-guidelines.md");

  it("should have usage guide documentation", () => {
    expect(existsSync(usageGuidePath)).toBe(true);
  });

  it("should have naming convention documentation", () => {
    expect(existsSync(namingConventionPath)).toBe(true);
  });

  it("should have contribution guidelines documentation", () => {
    expect(existsSync(contributionGuidelinesPath)).toBe(true);
  });

  it("should document token usage examples", () => {
    const usageGuide = readFileSync(usageGuidePath, "utf-8");

    // Check for usage sections
    expect(usageGuide).toMatch(/Usage/);
    expect(usageGuide).toMatch(/CSS/);
    expect(usageGuide).toMatch(/Tailwind/);
    expect(usageGuide).toMatch(/TypeScript/);
  });

  it("should document token naming convention", () => {
    const namingConvention = readFileSync(namingConventionPath, "utf-8");

    // Check for naming convention sections
    expect(namingConvention).toMatch(/Naming Convention/);
    expect(namingConvention).toMatch(/camelCase/);
    expect(namingConvention).toMatch(/kebab-case/);
  });

  it("should document contribution guidelines", () => {
    const contributionGuidelines = readFileSync(contributionGuidelinesPath, "utf-8");

    // Check for contribution sections
    expect(contributionGuidelines).toMatch(/Contribution/);
    expect(contributionGuidelines).toMatch(/Guidelines/);
  });

  it("should have usage examples for spacing tokens", () => {
    const usageGuide = readFileSync(usageGuidePath, "utf-8");

    // Check for spacing examples
    expect(usageGuide).toMatch(/spacing/);
  });

  it("should have usage examples for color tokens", () => {
    const usageGuide = readFileSync(usageGuidePath, "utf-8");

    // Check for color examples
    expect(usageGuide).toMatch(/color/);
    expect(usageGuide).toMatch(/theme/);
  });

  it("should have usage examples for typography tokens", () => {
    const usageGuide = readFileSync(usageGuidePath, "utf-8");

    // Check for typography examples
    expect(usageGuide).toMatch(/Typography/);
    expect(usageGuide).toMatch(/font/);
  });

  it("should document token categories", () => {
    const namingConvention = readFileSync(namingConventionPath, "utf-8");

    // Check for category documentation
    expect(namingConvention).toMatch(/categories/);
    expect(namingConvention).toMatch(/spacing/);
    expect(namingConvention).toMatch(/color/);
    expect(namingConvention).toMatch(/typography/);
  });

  it("should have code examples in documentation", () => {
    const usageGuide = readFileSync(usageGuidePath, "utf-8");

    // Check for code blocks
    expect(usageGuide).toMatch(/```/);
  });

  it("should document token file structure", () => {
    const contributionGuidelines = readFileSync(contributionGuidelinesPath, "utf-8");

    // Check for file structure documentation
    expect(contributionGuidelines).toMatch(/\.design\/tokens/);
    expect(contributionGuidelines).toMatch(/\.json/);
  });

  it("should document token generation process", () => {
    const contributionGuidelines = readFileSync(contributionGuidelinesPath, "utf-8");

    // Check for generation process documentation
    expect(contributionGuidelines).toMatch(/generate/);
    expect(contributionGuidelines).toMatch(/script/);
  });
});
