import type { Config } from "tailwindcss";

// Import design tokens CSS file
import "./src/design/tokens.css";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "var(--spacing-md)",
        sm: "var(--spacing-lg)",
        lg: "var(--spacing-xl)",
        xl: "var(--spacing-2xl)",
        "2xl": "var(--spacing-3xl)",
      },
    },
    extend: {
      colors: {
        background: "var(--background-primary)",
        foreground: "var(--foreground-primary)",
        card: {
          DEFAULT: "var(--background-card)",
          foreground: "var(--foreground-primary)",
        },
        primary: {
          DEFAULT: "var(--primary-default)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary-default)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--background-muted)",
          foreground: "var(--foreground-muted)",
        },
        accent: {
          DEFAULT: "var(--background-secondary)",
          foreground: "var(--foreground-accent)",
        },
        destructive: {
          DEFAULT: "var(--destructive-default)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--background-border)",
        input: "var(--background-input)",
        ring: "var(--primary-default)",
        // Semantic color tokens
        success: {
          DEFAULT: "var(--success-default)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning-default)",
          foreground: "var(--warning-foreground)",
        },
        info: {
          DEFAULT: "var(--info-default)",
          foreground: "var(--info-foreground)",
        },
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
      },
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        fixed: "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-tight)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-normal)" }],
        base: ["var(--text-base)", { lineHeight: "var(--leading-normal)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-normal)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--leading-relaxed)" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-relaxed)" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "var(--leading-relaxed)" }],
        "4xl": ["var(--text-4xl)", { lineHeight: "1.1" }],
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontWeight: {
        normal: "var(--font-normal)",
        medium: "var(--font-medium)",
        semibold: "var(--font-semibold)",
        bold: "var(--font-bold)",
      },
      animation: {
        "fade-in": "fade-in var(--duration-normal) var(--ease-default)",
        "fade-out": "fade-out var(--duration-normal) var(--ease-in)",
        "slide-in-from-top": "slide-in-from-top var(--duration-normal) var(--ease-default)",
        "slide-in-from-bottom": "slide-in-from-bottom var(--duration-normal) var(--ease-default)",
        "slide-in-from-left": "slide-in-from-left var(--duration-normal) var(--ease-default)",
        "slide-in-from-right": "slide-in-from-right var(--duration-normal) var(--ease-default)",
        "scale-in": "scale-in var(--duration-fast) var(--ease-default)",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
