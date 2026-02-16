import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

describe("TASK-006: TypeScript Token Type Generation", () => {
  const typesFilePath = resolve(__dirname, "../../../src/design/tokens.types.ts");
  const generatorScriptPath = resolve(__dirname, "../../../scripts/generate-ts-types.ts");

  it("should have TypeScript type generator script", () => {
    expect(existsSync(generatorScriptPath)).toBe(true);
  });

  it("should generate TypeScript types file", () => {
    expect(existsSync(typesFilePath)).toBe(true);
  });

  it("should export token value types", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for color token types
    expect(typesFile).toMatch(/export type ColorToken/);
    expect(typesFile).toMatch(/export type SpacingToken/);
    expect(typesFile).toMatch(/export type BorderRadiusToken/);
    expect(typesFile).toMatch(/export type ShadowToken/);
  });

  it("should export token category types", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for category types
    expect(typesFile).toMatch(/export interface SpacingTokens/);
    expect(typesFile).toMatch(/export interface BorderRadiusTokens/);
    expect(typesFile).toMatch(/export interface ShadowTokens/);
    expect(typesFile).toMatch(/export interface TypographyTokens/);
    expect(typesFile).toMatch(/export interface AnimationTokens/);
  });

  it("should export token value constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for constant exports
    expect(typesFile).toMatch(/export const/);
    expect(typesFile).toMatch(/SPACING_/);
    expect(typesFile).toMatch(/RADIUS_/);
  });

  it("should have all spacing token constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for spacing constants
    expect(typesFile).toMatch(/SPACING_XS/);
    expect(typesFile).toMatch(/SPACING_SM/);
    expect(typesFile).toMatch(/SPACING_MD/);
    expect(typesFile).toMatch(/SPACING_LG/);
    expect(typesFile).toMatch(/SPACING_XL/);
    expect(typesFile).toMatch(/SPACING_2XL/);
    expect(typesFile).toMatch(/SPACING_3XL/);
  });

  it("should have all border radius token constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for border radius constants
    expect(typesFile).toMatch(/RADIUS_NONE/);
    expect(typesFile).toMatch(/RADIUS_SM/);
    expect(typesFile).toMatch(/RADIUS_MD/);
    expect(typesFile).toMatch(/RADIUS_LG/);
    expect(typesFile).toMatch(/RADIUS_XL/);
    expect(typesFile).toMatch(/RADIUS_FULL/);
  });

  it("should have all shadow token constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for shadow constants
    expect(typesFile).toMatch(/SHADOW_XS/);
    expect(typesFile).toMatch(/SHADOW_SM/);
    expect(typesFile).toMatch(/SHADOW_MD/);
    expect(typesFile).toMatch(/SHADOW_LG/);
    expect(typesFile).toMatch(/SHADOW_XL/);
  });

  it("should have all z-index token constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for z-index constants
    expect(typesFile).toMatch(/Z_DROPDOWN/);
    expect(typesFile).toMatch(/Z_STICKY/);
    expect(typesFile).toMatch(/Z_FIXED/);
    expect(typesFile).toMatch(/Z_MODAL_BACKDROP/);
    expect(typesFile).toMatch(/Z_MODAL/);
    expect(typesFile).toMatch(/Z_POPOVER/);
    expect(typesFile).toMatch(/Z_TOOLTIP/);
  });

  it("should have all font size token constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for font size constants
    expect(typesFile).toMatch(/FONT_SIZE_XS/);
    expect(typesFile).toMatch(/FONT_SIZE_SM/);
    expect(typesFile).toMatch(/FONT_SIZE_BASE/);
    expect(typesFile).toMatch(/FONT_SIZE_LG/);
    expect(typesFile).toMatch(/FONT_SIZE_XL/);
    expect(typesFile).toMatch(/FONT_SIZE_2XL/);
    expect(typesFile).toMatch(/FONT_SIZE_3XL/);
    expect(typesFile).toMatch(/FONT_SIZE_4XL/);
  });

  it("should have all font weight token constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for font weight constants
    expect(typesFile).toMatch(/FONT_WEIGHT_NORMAL/);
    expect(typesFile).toMatch(/FONT_WEIGHT_MEDIUM/);
    expect(typesFile).toMatch(/FONT_WEIGHT_SEMIBOLD/);
    expect(typesFile).toMatch(/FONT_WEIGHT_BOLD/);
  });

  it("should have all animation duration token constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for animation duration constants
    expect(typesFile).toMatch(/DURATION_FAST/);
    expect(typesFile).toMatch(/DURATION_NORMAL/);
    expect(typesFile).toMatch(/DURATION_SLOW/);
  });

  it("should have all animation easing token constants", () => {
    const typesFile = readFileSync(typesFilePath, "utf-8");

    // Check for animation easing constants
    expect(typesFile).toMatch(/EASE_DEFAULT/);
    expect(typesFile).toMatch(/EASE_IN/);
    expect(typesFile).toMatch(/EASE_OUT/);
    expect(typesFile).toMatch(/EASE_BOUNCE/);
  });
});
