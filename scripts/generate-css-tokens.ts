/**
 * CSS Custom Properties Generator
 *
 * This script reads design token JSON files and generates CSS custom properties.
 * It supports theme variants (light/dark) and organizes tokens by category.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface ColorTokens {
  colors: {
    light: Record<string, any>;
    dark: Record<string, any>;
  };
}

interface DesignTokens {
  colors?: ColorTokens["colors"];
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  shadows?: Record<string, string>;
  animation?: {
    duration?: Record<string, number>;
    easing?: Record<string, string>;
  };
  zIndex?: Record<string, number>;
  typography?: {
    fontFamily?: Record<string, string[]>;
    fontSize?: Record<string, any>;
    fontWeight?: Record<string, string>;
    lineHeight?: Record<string, string>;
  };
  breakpoints?: Record<string, number>;
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
}

function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${toKebabCase(key)}` : toKebabCase(key);

    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      // Handle font-size arrays: ["0.75rem", { "lineHeight": "1rem" }]
      result[newKey] = value[0];
    } else {
      result[newKey] = String(value);
    }
  }

  return result;
}

function generateColorCSS(colors: ColorTokens["colors"], theme: "light" | "dark"): string {
  const themeColors = colors[theme];
  const flat = flattenObject(themeColors);
  let css = "";

  for (const [key, value] of Object.entries(flat)) {
    css += `  --${key}: ${value};\n`;
  }

  return css;
}

function generateSpacingCSS(spacing: Record<string, string>): string {
  let css = "";
  for (const [key, value] of Object.entries(spacing)) {
    css += `  --spacing-${toKebabCase(key)}: ${value};\n`;
  }
  return css;
}

function generateBorderRadiusCSS(borderRadius: Record<string, string>): string {
  let css = "";
  for (const [key, value] of Object.entries(borderRadius)) {
    const cssVar = key === "DEFAULT" ? "--radius" : `--radius-${toKebabCase(key)}`;
    css += `  ${cssVar}: ${value};\n`;
  }
  return css;
}

function generateShadowCSS(shadows: Record<string, string>): string {
  let css = "";
  for (const [key, value] of Object.entries(shadows)) {
    const cssVar = key === "DEFAULT" ? "--shadow" : `--shadow-${toKebabCase(key)}`;
    css += `  ${cssVar}: ${value};\n`;
  }
  return css;
}

function generateAnimationCSS(animation: DesignTokens["animation"]): string {
  let css = "";

  if (animation?.duration) {
    for (const [key, value] of Object.entries(animation.duration)) {
      css += `  --duration-${toKebabCase(key)}: ${value}ms;\n`;
    }
  }

  if (animation?.easing) {
    for (const [key, value] of Object.entries(animation.easing)) {
      css += `  --ease-${toKebabCase(key)}: ${value};\n`;
    }
  }

  return css;
}

function generateZIndexCSS(zIndex: Record<string, number>): string {
  let css = "";
  for (const [key, value] of Object.entries(zIndex)) {
    css += `  --z-${toKebabCase(key)}: ${value};\n`;
  }
  return css;
}

function generateTypographyCSS(typography: DesignTokens["typography"]): string {
  let css = "";

  if (typography?.fontFamily) {
    for (const [key, value] of Object.entries(typography.fontFamily)) {
      css += `  --font-${toKebabCase(key)}: ${value.join(", ")};\n`;
    }
  }

  if (typography?.fontSize) {
    for (const [key, value] of Object.entries(typography.fontSize)) {
      const cssVar = `--text-${toKebabCase(key)}`;
      css += `  ${cssVar}: ${Array.isArray(value) ? value[0] : value};\n`;
    }
  }

  if (typography?.fontWeight) {
    for (const [key, value] of Object.entries(typography.fontWeight)) {
      css += `  --font-${toKebabCase(key)}: ${value};\n`;
    }
  }

  if (typography?.lineHeight) {
    for (const [key, value] of Object.entries(typography.lineHeight)) {
      css += `  --leading-${toKebabCase(key)}: ${value};\n`;
    }
  }

  return css;
}

function generateCSSTokens(): string {
  const designDir = join(process.cwd(), ".design", "tokens");
  const tokens: DesignTokens = {};

  // Read all token files
  const files = readdirSync(designDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = join(designDir, file);
    const content = JSON.parse(readFileSync(filePath, "utf-8"));

    // Merge token categories
    Object.assign(tokens, content);
  }

  let css = `/**
 * PLM Design System - CSS Custom Properties
 * Auto-generated from .design/tokens/*.json
 * DO NOT EDIT MANUALLY
 */

`;

  // Root variables (theme-independent)
  css += `:root {\n`;
  if (tokens.spacing) css += generateSpacingCSS(tokens.spacing);
  if (tokens.borderRadius) css += generateBorderRadiusCSS(tokens.borderRadius);
  if (tokens.shadows) css += generateShadowCSS(tokens.shadows);
  if (tokens.animation) css += generateAnimationCSS(tokens.animation);
  if (tokens.zIndex) css += generateZIndexCSS(tokens.zIndex);
  if (tokens.typography) css += generateTypographyCSS(tokens.typography);
  css += `}\n\n`;

  // Light theme
  if (tokens.colors) {
    css += `/* Light theme */\n`;
    css += `.light {\n`;
    css += generateColorCSS(tokens.colors, "light");
    css += `}\n\n`;

    // Dark theme
    css += `/* Dark theme */\n`;
    css += `.dark {\n`;
    css += generateColorCSS(tokens.colors, "dark");
    css += `}\n`;
  }

  return css;
}

function main() {
  const outputDir = join(process.cwd(), "src", "design");

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const css = generateCSSTokens();
  const outputPath = join(outputDir, "tokens.css");

  writeFileSync(outputPath, css, "utf-8");
  console.log(`✅ Generated CSS custom properties: ${outputPath}`);
}

// Always run main when script is executed
main();

export { generateCSSTokens };
