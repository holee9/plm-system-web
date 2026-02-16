/**
 * PLM Design System Tokens
 *
 * Design tokens provide a single source of truth for design values.
 * These can be used in JavaScript/TypeScript code for dynamic styling.
 */

export const designTokens = {
  // Spacing tokens (in rem)
  spacing: {
    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "1rem",       // 16px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    "2xl": "3rem",    // 48px
    "3xl": "4rem",    // 64px
  },

  // Border radius tokens
  radius: {
    sm: "0.25rem",    // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    full: "9999px",
  },

  // Typography tokens
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },

  // Line height tokens
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },

  // Z-index tokens
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Animation duration tokens (in ms)
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Animation easing tokens
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // Breakpoint tokens (in px) - matching Tailwind defaults
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
} as const;

export type DesignTokenKey = keyof typeof designTokens;
export type SpacingToken = keyof typeof designTokens.spacing;
export type RadiusToken = keyof typeof designTokens.radius;
export type DurationToken = keyof typeof designTokens.duration;
