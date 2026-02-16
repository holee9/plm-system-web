/**
 * PLM Design System - TypeScript Types
 *
 * Type definitions for design tokens.
 * Auto-generated from src/design/design-tokens.json
 * Version: 2.0.0
 */

// ============================================================================
// TOKEN VALUE TYPES
// ============================================================================

// Spacing tokens
export const SPACING_XS: "0.25rem" = "0.25rem" as const;
export const SPACING_SM: "0.5rem" = "0.5rem" as const;
export const SPACING_MD: "1rem" = "1rem" as const;
export const SPACING_LG: "1.5rem" = "1.5rem" as const;
export const SPACING_XL: "2rem" = "2rem" as const;
export const SPACING_2XL: "3rem" = "3rem" as const;
export const SPACING_3XL: "4rem" = "4rem" as const;

export type SpacingToken =
  | typeof SPACING_XS
  | typeof SPACING_SM
  | typeof SPACING_MD
  | typeof SPACING_LG
  | typeof SPACING_XL
  | typeof SPACING_2XL
  | typeof SPACING_3XL;

// Border radius tokens
export const RADIUS_NONE: "0" = "0" as const;
export const RADIUS_SM: "0.25rem" = "0.25rem" as const;
export const RADIUS: "0.5rem" = "0.5rem" as const;
export const RADIUS_MD: "0.5rem" = "0.5rem" as const;
export const RADIUS_LG: "0.75rem" = "0.75rem" as const;
export const RADIUS_XL: "1rem" = "1rem" as const;
export const RADIUS_FULL: "9999px" = "9999px" as const;

export type BorderRadiusToken =
  | typeof RADIUS_NONE
  | typeof RADIUS_SM
  | typeof RADIUS
  | typeof RADIUS_MD
  | typeof RADIUS_LG
  | typeof RADIUS_XL
  | typeof RADIUS_FULL;

// Shadow tokens
export const SHADOW_XS: "0 1px 1px 0 rgb(0 0 0 / 0.05)" = "0 1px 1px 0 rgb(0 0 0 / 0.05)" as const;
export const SHADOW_SM: "0 1px 2px 0 rgb(0 0 0 / 0.05)" = "0 1px 2px 0 rgb(0 0 0 / 0.05)" as const;
export const SHADOW: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" = "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" as const;
export const SHADOW_MD: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" = "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" as const;
export const SHADOW_LG: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" as const;
export const SHADOW_XL: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" = "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" as const;

export type ShadowToken =
  | typeof SHADOW_XS
  | typeof SHADOW_SM
  | typeof SHADOW_MD
  | typeof SHADOW_LG
  | typeof SHADOW_XL;

// Z-index tokens
export const Z_DROPDOWN: 1000 = 1000 as const;
export const Z_STICKY: 1020 = 1020 as const;
export const Z_FIXED: 1030 = 1030 as const;
export const Z_MODAL_BACKDROP: 1040 = 1040 as const;
export const Z_MODAL: 1050 = 1050 as const;
export const Z_POPOVER: 1060 = 1060 as const;
export const Z_TOOLTIP: 1070 = 1070 as const;

export type ZIndexToken =
  | typeof Z_DROPDOWN
  | typeof Z_STICKY
  | typeof Z_FIXED
  | typeof Z_MODAL_BACKDROP
  | typeof Z_MODAL
  | typeof Z_POPOVER
  | typeof Z_TOOLTIP;

// Font size tokens
export const FONT_SIZE_XS: "0.75rem" = "0.75rem" as const;
export const FONT_SIZE_SM: "0.875rem" = "0.875rem" as const;
export const FONT_SIZE_BASE: "1rem" = "1rem" as const;
export const FONT_SIZE_LG: "1.125rem" = "1.125rem" as const;
export const FONT_SIZE_XL: "1.25rem" = "1.25rem" as const;
export const FONT_SIZE_2XL: "1.5rem" = "1.5rem" as const;
export const FONT_SIZE_3XL: "1.875rem" = "1.875rem" as const;
export const FONT_SIZE_4XL: "2.25rem" = "2.25rem" as const;

export type FontSizeToken =
  | typeof FONT_SIZE_XS
  | typeof FONT_SIZE_SM
  | typeof FONT_SIZE_BASE
  | typeof FONT_SIZE_LG
  | typeof FONT_SIZE_XL
  | typeof FONT_SIZE_2XL
  | typeof FONT_SIZE_3XL
  | typeof FONT_SIZE_4XL;

// Font weight tokens
export const FONT_WEIGHT_NORMAL: "400" = "400" as const;
export const FONT_WEIGHT_MEDIUM: "500" = "500" as const;
export const FONT_WEIGHT_SEMIBOLD: "600" = "600" as const;
export const FONT_WEIGHT_BOLD: "700" = "700" as const;

export type FontWeightToken =
  | typeof FONT_WEIGHT_NORMAL
  | typeof FONT_WEIGHT_MEDIUM
  | typeof FONT_WEIGHT_SEMIBOLD
  | typeof FONT_WEIGHT_BOLD;

// Animation duration tokens
export const DURATION_FAST: 150 = 150 as const;
export const DURATION_NORMAL: 300 = 300 as const;
export const DURATION_SLOW: 500 = 500 as const;

export type DurationToken =
  | typeof DURATION_FAST
  | typeof DURATION_NORMAL
  | typeof DURATION_SLOW;

// Animation easing tokens
export const EASE_DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)" = "cubic-bezier(0.4, 0, 0.2, 1)" as const;
export const EASE_IN: "cubic-bezier(0.4, 0, 1, 1)" = "cubic-bezier(0.4, 0, 1, 1)" as const;
export const EASE_OUT: "cubic-bezier(0, 0, 0.2, 1)" = "cubic-bezier(0, 0, 0.2, 1)" as const;
export const EASE_BOUNCE: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" = "cubic-bezier(0.68, -0.55, 0.265, 1.55)" as const;

export type EasingToken =
  | typeof EASE_DEFAULT
  | typeof EASE_IN
  | typeof EASE_OUT
  | typeof EASE_BOUNCE;

// ============================================================================
// PLM DOMAIN TOKEN TYPES
// ============================================================================

// Issue status tokens
export type IssueStatus = "todo" | "inProgress" | "inReview" | "done" | "blocked";
export type IssueStatusKey = `issue-${IssueStatus}`;

// Issue priority tokens
export type IssuePriority = "critical" | "high" | "medium" | "low";
export type IssuePriorityKey = `priority-${IssuePriority}`;

// PLM Part status tokens
export type PartStatus = "draft" | "pending" | "approved" | "released" | "obsolete";
export type PartStatusKey = `part-status-${PartStatus}`;

// PLM ECR status tokens
export type EcrStatus = "draft" | "submitted" | "underReview" | "approved" | "rejected" | "implemented";
export type EcrStatusKey = `ecr-status-${EcrStatus}`;

// PLM BOM status tokens
export type BomStatus = "draft" | "underReview" | "approved" | "released" | "superseded";
export type BomStatusKey = `bom-status-${BomStatus}`;

// Revision coding tokens
export type RevisionCode = "a" | "b" | "c" | "d" | "e";
export type RevisionKey = `revision-${RevisionCode}`;

// ============================================================================
// TOKEN CATEGORY INTERFACES
// ============================================================================

export interface SpacingTokens {
  xs: typeof SPACING_XS;
  sm: typeof SPACING_SM;
  md: typeof SPACING_MD;
  lg: typeof SPACING_LG;
  xl: typeof SPACING_XL;
  "2xl": typeof SPACING_2XL;
  "3xl": typeof SPACING_3XL;
}

export interface BorderRadiusTokens {
  none: typeof RADIUS_NONE;
  sm: typeof RADIUS_SM;
  DEFAULT: typeof RADIUS;
  md: typeof RADIUS_MD;
  lg: typeof RADIUS_LG;
  xl: typeof RADIUS_XL;
  full: typeof RADIUS_FULL;
}

export interface ShadowTokens {
  xs: typeof SHADOW_XS;
  sm: typeof SHADOW_SM;
  DEFAULT: typeof SHADOW;
  md: typeof SHADOW_MD;
  lg: typeof SHADOW_LG;
  xl: typeof SHADOW_XL;
}

export interface TypographyTokens {
  fontSize: {
    xs: typeof FONT_SIZE_XS;
    sm: typeof FONT_SIZE_SM;
    base: typeof FONT_SIZE_BASE;
    lg: typeof FONT_SIZE_LG;
    xl: typeof FONT_SIZE_XL;
    "2xl": typeof FONT_SIZE_2XL;
    "3xl": typeof FONT_SIZE_3XL;
    "4xl": typeof FONT_SIZE_4XL;
  };
  fontWeight: {
    normal: typeof FONT_WEIGHT_NORMAL;
    medium: typeof FONT_WEIGHT_MEDIUM;
    semibold: typeof FONT_WEIGHT_SEMIBOLD;
    bold: typeof FONT_WEIGHT_BOLD;
  };
}

export interface AnimationTokens {
  duration: {
    fast: typeof DURATION_FAST;
    normal: typeof DURATION_NORMAL;
    slow: typeof DURATION_SLOW;
  };
  easing: {
    default: typeof EASE_DEFAULT;
    in: typeof EASE_IN;
    out: typeof EASE_OUT;
    bounce: typeof EASE_BOUNCE;
  };
}

// ============================================================================
// PLM DOMAIN TOKEN INTERFACES
// ============================================================================

export interface IssueStatusTokens {
  todo: string;
  inProgress: string;
  inReview: string;
  done: string;
  blocked: string;
}

export interface IssuePriorityTokens {
  critical: string;
  high: string;
  medium: string;
  low: string;
}

export interface PartStatusTokens {
  draft: string;
  pending: string;
  approved: string;
  released: string;
  obsolete: string;
}

export interface EcrStatusTokens {
  draft: string;
  submitted: string;
  underReview: string;
  approved: string;
  rejected: string;
  implemented: string;
}

export interface BomStatusTokens {
  draft: string;
  underReview: string;
  approved: string;
  released: string;
  superseded: string;
}

export interface RevisionTokens {
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
}

// ============================================================================
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
  zIndex: {
    dropdown: Z_DROPDOWN,
    sticky: Z_STICKY,
    fixed: Z_FIXED,
    modalBackdrop: Z_MODAL_BACKDROP,
    modal: Z_MODAL,
    popover: Z_POPOVER,
    tooltip: Z_TOOLTIP,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get CSS variable reference for a design token
 * @param token - The CSS variable name (e.g., "spacing-md")
 * @returns CSS var() function string
 */
export function cssVar(token: string): string {
  return `var(--${token})`;
}

/**
 * Get HSL color value for use in CSS-in-JS
 * @param hsl - HSL value string (e.g., "221.2 83.2% 53.3%")
 * @returns CSS hsl() function string
 */
export function hsl(hsl: string): string {
  return `hsl(${hsl})`;
}

/**
 * Get issue status CSS variable name
 * @param status - Issue status key
 * @returns CSS variable name
 */
export function issueStatusVar(status: IssueStatus): string {
  const statusMap: Record<IssueStatus, string> = {
    todo: "todo",
    inProgress: "in-progress",
    inReview: "in-review",
    done: "done",
    blocked: "blocked",
  };
  return `issue-${statusMap[status]}`;
}

/**
 * Get PLM part status CSS variable name
 * @param status - Part status key
 * @returns CSS variable name
 */
export function partStatusVar(status: PartStatus): string {
  const statusMap: Record<PartStatus, string> = {
    draft: "draft",
    pending: "pending",
    approved: "approved",
    released: "released",
    obsolete: "obsolete",
  };
  return `part-status-${statusMap[status]}`;
}

/**
 * Get ECR status CSS variable name
 * @param status - ECR status key
 * @returns CSS variable name
 */
export function ecrStatusVar(status: EcrStatus): string {
  const statusMap: Record<EcrStatus, string> = {
    draft: "draft",
    submitted: "submitted",
    underReview: "under-review",
    approved: "approved",
    rejected: "rejected",
    implemented: "implemented",
  };
  return `ecr-status-${statusMap[status]}`;
}

/**
 * Get BOM status CSS variable name
 * @param status - BOM status key
 * @returns CSS variable name
 */
export function bomStatusVar(status: BomStatus): string {
  const statusMap: Record<BomStatus, string> = {
    draft: "draft",
    underReview: "under-review",
    approved: "approved",
    released: "released",
    superseded: "superseded",
  };
  return `bom-status-${statusMap[status]}`;
}
