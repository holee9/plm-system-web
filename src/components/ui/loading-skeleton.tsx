import { cn } from "@/lib/utils";

/**
 * Skeleton loading component for content placeholders
 * Provides visual feedback while content is loading
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Card skeleton loader
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6", className)}>
      <Skeleton className="mb-4 h-5 w-3/4" />
      <Skeleton className="mb-3 h-4 w-full" />
      <Skeleton className="mb-3 h-4 w-5/6" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex gap-4 border-b border-border pb-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * List skeleton loader
 */
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Spinner loading indicator
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex h-8 w-8 items-center justify-center", className)}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function FullPageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner className="h-12 w-12" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
