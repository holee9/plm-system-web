import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { IssueStatus, IssuePriority } from "~/modules/issue/types";

/**
 * StatusBadge component for PLM status indicators
 *
 * Displays colored badges for various PLM domain statuses:
 * - Issue status (todo, inProgress, inReview, done, blocked)
 * - Issue priority (critical, high, medium, low)
 * - Part status (draft, pending, approved, released, obsolete)
 * - ECR status (draft, submitted, underReview, approved, rejected, implemented)
 * - BOM status (draft, underReview, approved, released, superseded)
 *
 * @example
 * ```tsx
 * <StatusBadge status="issue-done" label="Done" />
 * <StatusBadge status="part-released" label="Released" />
 * <StatusBadge status="ecr-approved" label="Approved" />
 * ```
 */

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        // Issue statuses (matching types.ts IssueStatus)
        "issue-open": "border-transparent bg-issueStatus-open text-white",
        "issue-in_progress": "border-transparent bg-issueStatus-in_progress text-white",
        "issue-review": "border-transparent bg-issueStatus-review text-white",
        "issue-done": "border-transparent bg-issueStatus-done text-white",
        "issue-closed": "border-transparent bg-issueStatus-closed text-white",
        // Issue priorities (matching types.ts IssuePriority)
        "priority-urgent": "border-transparent bg-priority-urgent text-white",
        "priority-high": "border-transparent bg-priority-high text-white",
        "priority-medium": "border-transparent bg-priority-medium text-white",
        "priority-low": "border-transparent bg-priority-low text-white",
        "priority-none": "border-transparent bg-priority-none text-white",
        // Part statuses
        "part-draft": "border-transparent bg-partStatus-draft text-white",
        "part-pending": "border-transparent bg-partStatus-pending text-white",
        "part-approved": "border-transparent bg-partStatus-approved text-white",
        "part-released": "border-transparent bg-partStatus-released text-white",
        "part-obsolete": "border-transparent bg-partStatus-obsolete text-white",
        // ECR statuses
        "ecr-draft": "border-transparent bg-ecrStatus-draft text-white",
        "ecr-submitted": "border-transparent bg-ecrStatus-submitted text-white",
        "ecr-under_review": "border-transparent bg-ecrStatus-under_review text-white",
        "ecr-approved": "border-transparent bg-ecrStatus-approved text-white",
        "ecr-rejected": "border-transparent bg-ecrStatus-rejected text-white",
        "ecr-implemented": "border-transparent bg-ecrStatus-implemented text-white",
        // BOM statuses
        "bom-draft": "border-transparent bg-bomStatus-draft text-white",
        "bom-under_review": "border-transparent bg-bomStatus-under_review text-white",
        "bom-approved": "border-transparent bg-bomStatus-approved text-white",
        "bom-released": "border-transparent bg-bomStatus-released text-white",
        "bom-superseded": "border-transparent bg-bomStatus-superseded text-white",
        // Revision colors
        "revision-a": "border-transparent bg-revision-a text-white",
        "revision-b": "border-transparent bg-revision-b text-white",
        "revision-c": "border-transparent bg-revision-c text-white",
        "revision-d": "border-transparent bg-revision-d text-white",
        "revision-e": "border-transparent bg-revision-e text-white",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      status: "issue-open",
      size: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** The status type (determines color) */
  status: VariantProps<typeof statusBadgeVariants>["status"];
  /** Display label for the badge */
  label?: string;
  /** Icon to display before the label */
  icon?: React.ReactNode;
  /** Show a dot indicator */
  showDot?: boolean;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, label, icon, showDot = false, size = "default", ...props }, ref) => {
    return (
      <div
        className={cn(statusBadgeVariants({ status, size }), className)}
        ref={ref}
        {...props}
      >
        {showDot && (
          <span
            className="h-1.5 w-1.5 rounded-full bg-current opacity-50"
            aria-hidden="true"
          />
        )}
        {icon && <span className="h-3 w-3">{icon}</span>}
        {label && <span>{label}</span>}
      </div>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };

// Re-export types from types.ts
export type { IssueStatus, IssuePriority } from "~/modules/issue/types";

/**
 * Convert issue status to status badge prop
 */
export function issueStatusToBadge(status: IssueStatus): `issue-${IssueStatus}` {
  const statusMap: Record<IssueStatus, `issue-${IssueStatus}`> = {
    open: "issue-open",
    in_progress: "issue-in_progress",
    review: "issue-review",
    done: "issue-done",
    closed: "issue-closed",
  };
  return statusMap[status];
}

/**
 * Convert part status to status badge prop
 */
export function partStatusToBadge(status: PartStatus): `part-${PartStatus}` {
  const statusMap: Record<PartStatus, `part-${PartStatus}`> = {
    draft: "part-draft",
    pending: "part-pending",
    approved: "part-approved",
    released: "part-released",
    obsolete: "part-obsolete",
  };
  return statusMap[status];
}

/**
 * Helper type for part status values
 */
export type PartStatus =
  | "draft"
  | "pending"
  | "approved"
  | "released"
  | "obsolete";

/**
 * Helper type for ECR status values
 */
export type EcrStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "implemented";

/**
 * Helper type for BOM status values
 */
export type BomStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "released"
  | "superseded";

/**
 * Convert ECR status to status badge prop
 */
export function ecrStatusToBadge(status: EcrStatus): `ecr-${EcrStatus}` {
  const statusMap: Record<EcrStatus, `ecr-${EcrStatus}`> = {
    draft: "ecr-draft",
    submitted: "ecr-submitted",
    under_review: "ecr-under_review",
    approved: "ecr-approved",
    rejected: "ecr-rejected",
    implemented: "ecr-implemented",
  };
  return statusMap[status];
}

/**
 * Convert BOM status to status badge prop
 */
export function bomStatusToBadge(status: BomStatus): `bom-${BomStatus}` {
  const statusMap: Record<BomStatus, `bom-${BomStatus}`> = {
    draft: "bom-draft",
    under_review: "bom-under_review",
    approved: "bom-approved",
    released: "bom-released",
    superseded: "bom-superseded",
  };
  return statusMap[status];
}
