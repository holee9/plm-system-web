# Design Token Naming Convention

This document describes the naming conventions used for PLM design system tokens.

## Table of Contents

- [General Principles](#general-principles)
- [Token Categories](#token-categories)
- [Naming Formats](#naming-formats)
- [Specific Conventions](#specific-conventions)

## General Principles

1. **Consistency**: Use consistent naming across all token categories
2. **Clarity**: Names should be self-documenting and descriptive
3. **Scalability**: Names should support future additions without breaking changes
4. **Standards**: Follow industry standards for token naming (Design Tokens Community Group)

## Token Categories

Design tokens are organized into the following categories:

### Core Categories

- **spacing**: Spacing and layout tokens
- **borderRadius**: Border radius tokens
- **shadows**: Shadow and elevation tokens
- **typography**: Font family, size, weight, and line height tokens
- **colors**: Color tokens for all UI elements
- **animation**: Animation duration and easing tokens
- **zIndex**: Z-index layer tokens
- **breakpoints**: Responsive breakpoint tokens

### Semantic Categories

- **background**: Background colors
- **foreground**: Text and icon colors
- **primary**: Primary action colors
- **secondary**: Secondary action colors
- **destructive**: Destructive action colors
- **success**: Success state colors
- **warning**: Warning state colors
- **info**: Information state colors

## Naming Formats

### JSON Token Files (Source)

Token names in JSON files use **camelCase** format:

```json
{
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  }
}
```

### CSS Custom Properties (Generated)

CSS variables use **kebab-case** format:

```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
}
```

### TypeScript Constants (Generated)

TypeScript constants use **CONSTANT_CASE** format:

```typescript
export const SPACING_XS: "0.25rem" = "0.25rem" as const;
export const SPACING_SM: "0.5rem" = "0.5rem" as const;
export const SPACING_MD: "1rem" = "1rem" as const;
export const SPACING_LG: "1.5rem" = "1.5rem" as const;
export const SPACING_XL: "2rem" = "2rem" as const;
export const SPACING_2XL: "3rem" = "3rem" as const;
export const SPACING_3XL: "4rem" = "4rem" as const;
```

## Specific Conventions

### Spacing Tokens

**Format**: `{size}` or `{number}{unit}`

**Sizes**: `xs`, `sm`, `md` (default), `lg`, `xl`, `2xl`, `3xl`

**Examples**:
- JSON: `spacing.xs`, `spacing.sm`, `spacing.md`
- CSS: `--spacing-xs`, `--spacing-sm`, `--spacing-md`
- TS: `SPACING_XS`, `SPACING_SM`, `SPACING_MD`

### Border Radius Tokens

**Format**: `{size}` or `DEFAULT`

**Sizes**: `none`, `sm`, `DEFAULT`, `md`, `lg`, `xl`, `full`

**Examples**:
- JSON: `borderRadius.sm`, `borderRadius.DEFAULT`
- CSS: `--radius-sm`, `--radius`
- TS: `RADIUS_SM`, `RADIUS`

### Shadow Tokens

**Format**: `{size}` or `DEFAULT`

**Sizes**: `xs`, `sm`, `DEFAULT`, `md`, `lg`, `xl`

**Examples**:
- JSON: `shadows.xs`, `shadows.sm`, `shadows.DEFAULT`
- CSS: `--shadow-xs`, `--shadow-sm`, `--shadow`
- TS: `SHADOW_XS`, `SHADOW_SM`, `SHADOW`

### Typography Tokens

#### Font Family

**Format**: `{usage}`

**Examples**:
- JSON: `typography.fontFamily.sans`, `typography.fontFamily.mono`
- CSS: `--font-sans`, `--font-mono`
- TS: `FONT_SANS`, `FONT_MONO`

#### Font Size

**Format**: `{size}`

**Sizes**: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`

**Examples**:
- JSON: `typography.fontSize.xs`, `typography.fontSize.base`
- CSS: `--text-xs`, `--text-base`
- TS: `FONT_SIZE_XS`, `FONT_SIZE_BASE`

#### Font Weight

**Format**: `{weight}`

**Weights**: `normal`, `medium`, `semibold`, `bold`

**Examples**:
- JSON: `typography.fontWeight.normal`, `typography.fontWeight.semibold`
- CSS: `--font-normal`, `--font-semibold`
- TS: `FONT_WEIGHT_NORMAL`, `FONT_WEIGHT_SEMIBOLD`

#### Line Height

**Format**: `{height}`

**Heights**: `tight`, `normal`, `relaxed`

**Examples**:
- JSON: `typography.lineHeight.tight`, `typography.lineHeight.normal`
- CSS: `--leading-tight`, `--leading-normal`
- TS: `LEADING_TIGHT`, `LEADING_NORMAL`

### Color Tokens

#### Color Structure

Colors are organized hierarchically:

```
{category}-{semantic}-{variant}
```

**Categories**: `background`, `foreground`, `border`, `input`

**Semantics**: `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `info`

**Variants**: `default`, `foreground` (or specific usage)

**Examples**:
- `background-primary` - Primary background color
- `foreground-secondary` - Secondary text color
- `primary-default` - Primary action color
- `destructive-foreground` - Destructive text color

#### Theme Variants

Each color has light and dark theme variants:

```css
/* Light theme */
.light {
  --background-primary: #ffffff;
  --foreground-primary: #09090b;
}

/* Dark theme */
.dark {
  --background-primary: #09090b;
  --foreground-primary: #fafafa;
}
```

### Animation Tokens

#### Duration

**Format**: `{speed}`

**Speeds**: `fast`, `normal`, `slow`

**Examples**:
- JSON: `animation.duration.fast`, `animation.duration.normal`
- CSS: `--duration-fast`, `--duration-normal`
- TS: `DURATION_FAST`, `DURATION_NORMAL`

#### Easing

**Format**: `{function}`

**Functions**: `default`, `in`, `out`, `bounce`

**Examples**:
- JSON: `animation.easing.default`, `animation.easing.out`
- CSS: `--ease-default`, `--ease-out`
- TS: `EASE_DEFAULT`, `EASE_OUT`

### Z-Index Tokens

**Format**: `{layer}`

**Layers**: `dropdown`, `sticky`, `fixed`, `modal-backdrop`, `modal`, `popover`, `tooltip`

**Examples**:
- JSON: `zIndex.dropdown`, `zIndex.modal`
- CSS: `--z-dropdown`, `--z-modal`
- TS: `Z_DROPDOWN`, `Z_MODAL`

### Breakpoint Tokens

**Format**: `{size}`

**Sizes**: `sm`, `md`, `lg`, `xl`, `2xl`

**Examples**:
- JSON: `breakpoints.sm`, `breakpoints.md`
- CSS: `--breakpoint-sm`, `--breakpoint-md`
- TS: `BREAKPOINT_SM`, `BREAKPOINT_MD`

## Conversion Rules

### camelCase to kebab-case

Convert from camelCase to kebab-case for CSS variables:

```javascript
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// Examples:
// spacingXs → --spacing-xs
// fontWeightSemibold → --font-weight-semibold
```

### camelCase to CONSTANT_CASE

Convert from camelCase to CONSTANT_CASE for TypeScript constants:

```javascript
function toConstantCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
}

// Examples:
// spacingXs → SPACING_XS
// fontWeightSemibold → FONT_WEIGHT_SEMIBOLD
```

## Adding New Tokens

When adding new tokens, follow these steps:

1. **Choose the appropriate category** or create a new one if needed
2. **Follow the naming convention** for that category
3. **Add to JSON file** in `.design/tokens/{category}.json`
4. **Generate CSS and TypeScript** using the generation scripts
5. **Update documentation** with usage examples
6. **Test in both themes** (for color tokens)

## Migration Guide

When renaming existing tokens:

1. **Add new token** with the new name
2. **Deprecate old token** but keep it for backward compatibility
3. **Update all references** in the codebase
4. **Remove deprecated token** in the next major version

## Resources

- [Design Tokens Community Group](https://www.tr.designtokens.org/)
- [Design Tokens Format Specification](https://tr.designtokens.org/format/)
- [W3C Design Tokens](https://www.w3.org/community/design-tokens/)
