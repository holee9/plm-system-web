# Design Tokens Usage Guide

This guide explains how to use PLM design system tokens in your application.

## Table of Contents

- [CSS Custom Properties](#css-custom-properties)
- [Tailwind CSS Integration](#tailwind-css-integration)
- [TypeScript Types](#typescript-types)
- [Theme Switching](#theme-switching)

## CSS Custom Properties

Design tokens are available as CSS custom properties (CSS variables) that can be used directly in your styles.

### Spacing

```css
.my-component {
  padding: var(--spacing-md);
  margin: var(--spacing-lg);
  gap: var(--spacing-sm);
}
```

### Colors

```css
.button {
  background-color: var(--primary-default);
  color: var(--primary-foreground);
}

.button:hover {
  background-color: var(--background-secondary);
}
```

### Typography

```css
.heading {
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
}
```

### Border Radius

```css
.card {
  border-radius: var(--radius-md);
}

.button {
  border-radius: var(--radius-full);
}
```

### Shadows

```css
.card {
  box-shadow: var(--shadow-md);
}

.dropdown {
  box-shadow: var(--shadow-lg);
}
```

### Animation

```css
.fade-in {
  animation-duration: var(--duration-normal);
  animation-timing-function: var(--ease-default);
}
```

### Z-Index

```css
.modal {
  z-index: var(--z-modal);
}

.modal-backdrop {
  z-index: var(--z-modal-backdrop);
}
```

## Tailwind CSS Integration

Design tokens are integrated with Tailwind CSS, so you can use them in your className props.

### Spacing Utilities

```tsx
<div className="p-md lg-lg">Padding and margin</div>
<div className="gap-sm">Flex gap</div>
```

### Color Utilities

```tsx
<button className="bg-background text-foreground">Button</button>
<div className="bg-primary text-primary-foreground">Primary</div>
<div className="bg-destructive text-destructive-foreground">Destructive</div>
```

### Typography Utilities

```tsx
<h1 className="text-xl font-semibold">Heading</h1>
<p className="text-base font-normal">Body text</p>
```

### Border Radius Utilities

```tsx
<div className="rounded-md">Card</div>
<button className="rounded-full">Button</button>
```

### Shadow Utilities

```tsx
<div className="shadow-md">Card with shadow</div>
<div className="shadow-lg">Elevated card</div>
```

### Z-Index Utilities

```tsx
<div className="z-modal">Modal</div>
<div className="z-tooltip">Tooltip</div>
```

## TypeScript Types

Design tokens are exported as TypeScript types and constants for type safety.

### Import Types

```typescript
import {
  SPACING_MD,
  RADIUS_LG,
  SHADOW_MD,
  FONT_SIZE_XL,
  FONT_WEIGHT_SEMIBOLD,
  DURATION_NORMAL,
  EASE_DEFAULT,
  type SpacingToken,
  type BorderRadiusToken,
  type ShadowToken,
  type FontSizeToken,
  type FontWeightToken,
} from "@/design/tokens.types";
```

### Use Constants

```typescript
const styles = {
  padding: SPACING_MD, // "1rem"
  borderRadius: RADIUS_LG, // "0.75rem"
  boxShadow: SHADOW_MD, // "0 4px 6px..."
  fontSize: FONT_SIZE_XL, // "1.25rem"
  fontWeight: FONT_WEIGHT_SEMIBOLD, // "600"
  animationDuration: DURATION_NORMAL, // 300
  animationTiming: EASE_DEFAULT, // "cubic-bezier(0.4, 0, 0.2, 1)"
};
```

### Type Annotations

```typescript
function setSpacing(value: SpacingToken) {
  // Type-safe spacing value
}

function setBorderRadius(value: BorderRadiusToken) {
  // Type-safe border radius value
}
```

### Token Objects

```typescript
import { tokens } from "@/design/tokens.types";

const { spacing, borderRadius, shadows } = tokens;

console.log(spacing.md); // "1rem"
console.log(borderRadius.lg); // "0.75rem"
console.log(shadows.md); // "0 4px 6px..."
```

## Theme Switching

The design system supports light and dark themes that automatically switch color tokens.

### Using Theme Provider

Wrap your application with the ThemeProvider:

```tsx
import { ThemeProvider } from "@/components/theme-provider";

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme Toggle

Add the theme toggle button to your UI:

```tsx
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### Programmatic Theme Control

```tsx
import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("system")}>System</button>
    </div>
  );
}
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values for consistency
2. **Prefer Tailwind utilities** for common patterns
3. **Use TypeScript types** for type safety in dynamic styles
4. **Test in both themes** to ensure color contrast and readability
5. **Use semantic colors** (primary, destructive, success) over raw colors

## Examples

### Complete Component Example

```tsx
import { Button } from "@/components/ui/button";
import { tokens } from "@/design/tokens.types";

export function Card({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-lg shadow-md bg-background text-foreground p-md border border-border"
      style={{
        padding: tokens.spacing.md,
        borderRadius: tokens.borderRadius.lg,
        boxShadow: tokens.shadows.md
      }}
    >
      <h3 className="text-xl font-semibold mb-sm">{title}</h3>
      <p className="text-base font-normal text-secondary-foreground">{description}</p>
      <Button className="mt-md">Action</Button>
    </div>
  );
}
```

### Responsive Spacing Example

```tsx
export function ResponsiveContainer() {
  return (
    <div className="p-sm md:md lg:xl">
      {/* Responsive padding using Tailwind utilities */}
    </div>
  );
}
```

### Theme-Aware Component Example

```tsx
import { useTheme } from "next-themes";

export function ThemedComponent() {
  const { theme } = useTheme();

  return (
    <div className="bg-background text-foreground">
      <p>Current theme: {theme}</p>
      {/* Colors automatically adjust based on theme */}
    </div>
  );
}
```
