import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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
        // Issue statuses
        "issue-todo": "border-transparent bg-issueStatus-todo text-white",
        "issue-in-progress": "border-transparent bg-issueStatus-inProgress text-white",
        "issue-in-review": "border-transparent bg-issueStatus-inReview text-white",
        "issue-done": "border-transparent bg-issueStatus-done text-white",
        "issue-blocked": "border-transparent bg-issueStatus-blocked text-white",
        // Issue priorities
        "priority-critical": "border-transparent bg-priority-critical text-white",
        "priority-high": "border-transparent bg-priority-high text-white",
        "priority-medium": "border-transparent bg-priority-medium text-white",
        "priority-low": "border-transparent bg-priority-low text-white",
        // Part statuses
        "part-draft": "border-transparent bg-partStatus-draft text-white",
        "part-pending": "border-transparent bg-partStatus-pending text-white",
        "part-approved": "border-transparent bg-partStatus-approved text-white",
        "part-released": "border-transparent bg-partStatus-released text-white",
        "part-obsolete": "border-transparent bg-partStatus-obsolete text-white",
        // ECR statuses
        "ecr-draft": "border-transparent bg-ecrStatus-draft text-white",
        "ecr-submitted": "border-transparent bg-ecrStatus-submitted text-white",
        "ecr-under-review": "border-transparent bg-ecrStatus-underReview text-white",
        "ecr-approved": "border-transparent bg-ecrStatus-approved text-white",
        "ecr-rejected": "border-transparent bg-ecrStatus-rejected text-white",
        "ecr-implemented": "border-transparent bg-ecrStatus-implemented text-white",
        // BOM statuses
        "bom-draft": "border-transparent bg-bomStatus-draft text-white",
        "bom-under-review": "border-transparent bg-bomStatus-underReview text-white",
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
      status: "issue-todo",
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

/**
 * Helper type for issue status values
 */
export type IssueStatus =
  | "todo"
  | "inProgress"
  | "inReview"
  | "done"
  | "blocked";

/**
 * Helper type for issue priority values
 */
export type IssuePriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

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
  | "underReview"
  | "approved"
  | "rejected"
  | "implemented";

/**
 * Helper type for BOM status values
 */
export type BomStatus =
  | "draft"
  | "underReview"
  | "approved"
  | "released"
  | "superseded";

/**
 * Convert issue status to status badge prop
 */
export function issueStatusToBadge(status: IssueStatus): `issue-${IssueStatus}` {
  const statusMap: Record<IssueStatus, `issue-${IssueStatus}`> = {
    todo: "issue-todo",
    inProgress: "issue-in-progress",
    inReview: "issue-in-review",
    done: "issue-done",
    blocked: "issue-blocked",
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
 * Convert ECR status to status badge prop
 */
export function ecrStatusToBadge(status: EcrStatus): `ecr-${EcrStatus}` {
  const statusMap: Record<EcrStatus, `ecr-${EcrStatus}`> = {
    draft: "ecr-draft",
    submitted: "ecr-submitted",
    underReview: "ecr-under-review",
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
    underReview: "bom-under-review",
    approved: "bom-approved",
    released: "bom-released",
    superseded: "bom-superseded",
  };
  return statusMap[status];
}
