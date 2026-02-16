/**
 * Skip to content link for keyboard navigation
 * Allows users to skip navigation and go directly to main content
 * Improves accessibility for keyboard and screen reader users
 */

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      data-testid="skip-link"
    >
      Skip to main content
    </a>
  );
}

/**
 * Visually hidden element for screen readers
 * Use for additional context that shouldn't be visible visually
 */
export function VisuallyHidden({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className="sr-only"
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Live region for announcing dynamic content changes to screen readers
 * Use aria-live="polite" for non-critical updates
 * Use aria-live="assertive" for critical updates that require immediate attention
 */
export function LiveRegion({
  children,
  politeness = "polite",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  politeness?: "polite" | "assertive" | "off";
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      {...props}
      className="sr-only"
    >
      {children}
    </div>
  );
}
