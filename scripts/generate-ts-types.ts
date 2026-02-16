/**
 * TypeScript Type Generator for Design Tokens
 *
 * This script reads design token JSON files and generates TypeScript types and constants.
 * It provides type safety and autocomplete for design tokens in the codebase.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface TokenValue {
  value: string;
  type?: string;
}

interface DesignTokens {
  colors?: {
    light?: Record<string, any>;
    dark?: Record<string, any>;
  };
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

function toPascalCase(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/\s+/g, "");
}

function toConstantCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/-/g, "_").toUpperCase();
}

function generateTypeScriptTypes(): string {
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

  let ts = `/**
 * PLM Design System - TypeScript Types
 * Auto-generated from .design/tokens/*.json
 * DO NOT EDIT MANUALLY
 */

// ============================================================================
// TOKEN VALUE TYPES
// ============================================================================

`;

  // Generate spacing types
  if (tokens.spacing) {
    ts += `// Spacing tokens\n`;
    for (const [key, value] of Object.entries(tokens.spacing)) {
      const constName = key === "DEFAULT" ? "SPACING" : `SPACING_${toConstantCase(key)}`;
      ts += `export const ${constName}: "${value}" = "${value}" as const;\n`;
    }
    ts += `\nexport type SpacingToken =\n`;
    const spacingKeys = Object.keys(tokens.spacing).filter((k) => k !== "DEFAULT");
    spacingKeys.forEach((key, index) => {
      const constName = `SPACING_${toConstantCase(key)}`;
      ts += `  | typeof ${constName}${index < spacingKeys.length - 1 ? "\n" : ";\n\n"}`;
    });
  }

  // Generate border radius types
  if (tokens.borderRadius) {
    ts += `// Border radius tokens\n`;
    for (const [key, value] of Object.entries(tokens.borderRadius)) {
      const constName = key === "DEFAULT" ? "RADIUS" : `RADIUS_${toConstantCase(key)}`;
      ts += `export const ${constName}: "${value}" = "${value}" as const;\n`;
    }
    ts += `\nexport type BorderRadiusToken =\n`;
    const radiusKeys = Object.keys(tokens.borderRadius).filter((k) => k !== "DEFAULT");
    radiusKeys.forEach((key, index) => {
      const constName = `RADIUS_${toConstantCase(key)}`;
      ts += `  | typeof ${constName}${index < radiusKeys.length - 1 ? "\n" : ";\n\n"}`;
    });
  }

  // Generate shadow types
  if (tokens.shadows) {
    ts += `// Shadow tokens\n`;
    for (const [key, value] of Object.entries(tokens.shadows)) {
      const constName = key === "DEFAULT" ? "SHADOW" : `SHADOW_${toConstantCase(key)}`;
      ts += `export const ${constName}: "${value}" = "${value}" as const;\n`;
    }
    ts += `\nexport type ShadowToken =\n`;
    const shadowKeys = Object.keys(tokens.shadows).filter((k) => k !== "DEFAULT");
    shadowKeys.forEach((key, index) => {
      const constName = `SHADOW_${toConstantCase(key)}`;
      ts += `  | typeof ${constName}${index < shadowKeys.length - 1 ? "\n" : ";\n\n"}`;
    });
  }

  // Generate z-index types
  if (tokens.zIndex) {
    ts += `// Z-index tokens\n`;
    for (const [key, value] of Object.entries(tokens.zIndex)) {
      const constName = `Z_${toConstantCase(key)}`;
      ts += `export const ${constName}: ${value} = ${value} as const;\n`;
    }
    ts += `\nexport type ZIndexToken =\n`;
    const zIndexKeys = Object.keys(tokens.zIndex);
    zIndexKeys.forEach((key, index) => {
      const constName = `Z_${toConstantCase(key)}`;
      ts += `  | typeof ${constName}${index < zIndexKeys.length - 1 ? "\n" : ";\n\n"}`;
    });
  }

  // Generate typography types
  if (tokens.typography) {
    if (tokens.typography.fontSize) {
      ts += `// Font size tokens\n`;
      for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
        const sizeValue = Array.isArray(value) ? value[0] : value;
        const constName = `FONT_SIZE_${toConstantCase(key)}`;
        ts += `export const ${constName}: "${sizeValue}" = "${sizeValue}" as const;\n`;
      }
      ts += `\nexport type FontSizeToken =\n`;
      const fontSizeKeys = Object.keys(tokens.typography.fontSize);
      fontSizeKeys.forEach((key, index) => {
        const constName = `FONT_SIZE_${toConstantCase(key)}`;
        ts += `  | typeof ${constName}${index < fontSizeKeys.length - 1 ? "\n" : ";\n\n"}`;
      });
    }

    if (tokens.typography.fontWeight) {
      ts += `// Font weight tokens\n`;
      for (const [key, value] of Object.entries(tokens.typography.fontWeight)) {
        const constName = `FONT_WEIGHT_${toConstantCase(key)}`;
        ts += `export const ${constName}: "${value}" = "${value}" as const;\n`;
      }
      ts += `\nexport type FontWeightToken =\n`;
      const fontWeightKeys = Object.keys(tokens.typography.fontWeight);
      fontWeightKeys.forEach((key, index) => {
        const constName = `FONT_WEIGHT_${toConstantCase(key)}`;
        ts += `  | typeof ${constName}${index < fontWeightKeys.length - 1 ? "\n" : ";\n\n"}`;
      });
    }
  }

  // Generate animation types
  if (tokens.animation) {
    if (tokens.animation.duration) {
      ts += `// Animation duration tokens\n`;
      for (const [key, value] of Object.entries(tokens.animation.duration)) {
        const constName = `DURATION_${toConstantCase(key)}`;
        ts += `export const ${constName}: ${value} = ${value} as const;\n`;
      }
      ts += `\nexport type DurationToken =\n`;
      const durationKeys = Object.keys(tokens.animation.duration);
      durationKeys.forEach((key, index) => {
        const constName = `DURATION_${toConstantCase(key)}`;
        ts += `  | typeof ${constName}${index < durationKeys.length - 1 ? "\n" : ";\n\n"}`;
      });
    }

    if (tokens.animation.easing) {
      ts += `// Animation easing tokens\n`;
      for (const [key, value] of Object.entries(tokens.animation.easing)) {
        const constName = `EASE_${toConstantCase(key)}`;
        ts += `export const ${constName}: "${value}" = "${value}" as const;\n`;
      }
      ts += `\nexport type EasingToken =\n`;
      const easingKeys = Object.keys(tokens.animation.easing);
      easingKeys.forEach((key, index) => {
        const constName = `EASE_${toConstantCase(key)}`;
        ts += `  | typeof ${constName}${index < easingKeys.length - 1 ? "\n" : ";\n\n"}`;
      });
    }
  }

  // Generate color token types
  if (tokens.colors) {
    ts += `// Color tokens\n`;
    ts += `export type ColorToken =\n`;
    ts += `  | "background-primary"\n`;
    ts += `  | "background-secondary"\n`;
    ts += `  | "foreground-primary"\n`;
    ts += `  | "foreground-secondary"\n`;
    ts += `  | "primary-default"\n`;
    ts += `  | "destructive-default"\n`;
    ts += `  | "success-default"\n`;
    ts += `  | "warning-default"\n`;
    ts += `  | "info-default"\n`;
    ts += `  | string; // Allow custom colors\n\n`;
  }

  // ============================================================================
  // TOKEN CATEGORY INTERFACES
  // ============================================================================

  ts += `// ============================================================================
// TOKEN CATEGORY INTERFACES
// ============================================================================

`;

  ts += `export interface SpacingTokens {
  xs: typeof SPACING_XS;
  sm: typeof SPACING_SM;
  md: typeof SPACING_MD;
  lg: typeof SPACING_LG;
  xl: typeof SPACING_XL;
  "2xl": typeof SPACING_2XL;
  "3xl": typeof SPACING_3XL;
}

`;

  ts += `export interface BorderRadiusTokens {
  none: typeof RADIUS_NONE;
  sm: typeof RADIUS_SM;
  DEFAULT: typeof RADIUS;
  md: typeof RADIUS_MD;
  lg: typeof RADIUS_LG;
  xl: typeof RADIUS_XL;
  full: typeof RADIUS_FULL;
}

`;

  ts += `export interface ShadowTokens {
  xs: typeof SHADOW_XS;
  sm: typeof SHADOW_SM;
  DEFAULT: typeof SHADOW;
  md: typeof SHADOW_MD;
  lg: typeof SHADOW_LG;
  xl: typeof SHADOW_XL;
}

`;

  if (tokens.typography) {
    ts += `export interface TypographyTokens {
`;
    if (tokens.typography.fontSize) {
      ts += `  fontSize: {\n`;
      Object.keys(tokens.typography.fontSize).forEach((key) => {
        const constName = `FONT_SIZE_${toConstantCase(key)}`;
        ts += `    ${key}: typeof ${constName};\n`;
      });
      ts += `  };\n`;
    }

    if (tokens.typography.fontWeight) {
      ts += `  fontWeight: {\n`;
      Object.keys(tokens.typography.fontWeight).forEach((key) => {
        const constName = `FONT_WEIGHT_${toConstantCase(key)}`;
        ts += `    ${key}: typeof ${constName};\n`;
      });
      ts += `  };\n`;
    }

    ts += `}\n\n`;
  }

  if (tokens.animation) {
    ts += `export interface AnimationTokens {
`;
    if (tokens.animation.duration) {
      ts += `  duration: {\n`;
      Object.keys(tokens.animation.duration).forEach((key) => {
        const constName = `DURATION_${toConstantCase(key)}`;
        ts += `    ${key}: typeof ${constName};\n`;
      });
      ts += `  };\n`;
    }

    if (tokens.animation.easing) {
      ts += `  easing: {\n`;
      Object.keys(tokens.animation.easing).forEach((key) => {
        const constName = `EASE_${toConstantCase(key)}`;
        ts += `    ${key}: typeof ${constName};\n`;
      });
      ts += `  };\n`;
    }

    ts += `}\n\n`;
  }

  ts += `// ============================================================================
// TOKENS EXPORT
// ============================================================================

export const tokens = {
  spacing: {
    xs: SPACING_XS,
    sm: SPACING_SM,
    md: SPACING_MD,
    lg: SPACING_LG,
    xl: SPACING_XL,
    "2xl": SPACING_2XL,
    "3xl": SPACING_3XL,
  },
  borderRadius: {
    none: RADIUS_NONE,
    sm: RADIUS_SM,
    DEFAULT: RADIUS,
    md: RADIUS_MD,
    lg: RADIUS_LG,
    xl: RADIUS_XL,
    full: RADIUS_FULL,
  },
  shadows: {
    xs: SHADOW_XS,
    sm: SHADOW_SM,
    DEFAULT: SHADOW,
    md: SHADOW_MD,
    lg: SHADOW_LG,
    xl: SHADOW_XL,
  },
`;

  if (tokens.zIndex) {
    ts += `  zIndex: {\n`;
    Object.keys(tokens.zIndex).forEach((key) => {
      const constName = `Z_${toConstantCase(key)}`;
      ts += `    ${key}: ${constName},\n`;
    });
    ts += `  },\n`;
  }

  ts += `} as const;\n`;

  return ts;
}

function main() {
  const outputDir = join(process.cwd(), "src", "design");

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const types = generateTypeScriptTypes();
  const outputPath = join(outputDir, "tokens.types.ts");

  writeFileSync(outputPath, types, "utf-8");
  console.log(`✅ Generated TypeScript types: ${outputPath}`);
}

// Always run main when script is executed
main();

export { generateTypeScriptTypes };
