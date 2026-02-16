/**
 * AuthLoadingSpinner Component
 *
 * A centered loading animation for authentication states.
 * Displays a spinner with a customizable message.
 */

import { cn } from "@/lib/utils";
import { designTokens } from "@/lib/design-tokens";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  message = "로그인 확인 중...",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8",
        className
      )}
    >
      {/* Spinner animation */}
      <div
        className="animate-spin rounded-full border-4 border-primary border-t-transparent"
        style={{
          width: designTokens.spacing.xl,
          height: designTokens.spacing.xl,
          borderWidth: "4px",
        }}
      />
      {/* Loading message */}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
