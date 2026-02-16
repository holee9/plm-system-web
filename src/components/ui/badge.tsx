import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        info:
          "border-transparent bg-info text-info-foreground hover:bg-info/80",
        // Issue status variants
        "issue-todo":
          "border-transparent bg-issueStatus-todo text-white",
        "issue-in-progress":
          "border-transparent bg-issueStatus-inProgress text-white",
        "issue-in-review":
          "border-transparent bg-issueStatus-inReview text-white",
        "issue-done":
          "border-transparent bg-issueStatus-done text-white",
        "issue-blocked":
          "border-transparent bg-issueStatus-blocked text-white",
        // Priority variants
        "priority-critical":
          "border-transparent bg-priority-critical text-white",
        "priority-high":
          "border-transparent bg-priority-high text-white",
        "priority-medium":
          "border-transparent bg-priority-medium text-white",
        "priority-low":
          "border-transparent bg-priority-low text-white",
        // Part status variants
        "part-draft":
          "border-transparent bg-partStatus-draft text-white",
        "part-pending":
          "border-transparent bg-partStatus-pending text-white",
        "part-approved":
          "border-transparent bg-partStatus-approved text-white",
        "part-released":
          "border-transparent bg-partStatus-released text-white",
        "part-obsolete":
          "border-transparent bg-partStatus-obsolete text-white",
        // ECR status variants
        "ecr-draft":
          "border-transparent bg-ecrStatus-draft text-white",
        "ecr-submitted":
          "border-transparent bg-ecrStatus-submitted text-white",
        "ecr-under-review":
          "border-transparent bg-ecrStatus-underReview text-white",
        "ecr-approved":
          "border-transparent bg-ecrStatus-approved text-white",
        "ecr-rejected":
          "border-transparent bg-ecrStatus-rejected text-white",
        "ecr-implemented":
          "border-transparent bg-ecrStatus-implemented text-white",
        // BOM status variants
        "bom-draft":
          "border-transparent bg-bomStatus-draft text-white",
        "bom-under-review":
          "border-transparent bg-bomStatus-underReview text-white",
        "bom-approved":
          "border-transparent bg-bomStatus-approved text-white",
        "bom-released":
          "border-transparent bg-bomStatus-released text-white",
        "bom-superseded":
          "border-transparent bg-bomStatus-superseded text-white",
        // Revision color variants
        "revision-a":
          "border-transparent bg-revision-a text-white",
        "revision-b":
          "border-transparent bg-revision-b text-white",
        "revision-c":
          "border-transparent bg-revision-c text-white",
        "revision-d":
          "border-transparent bg-revision-d text-white",
        "revision-e":
          "border-transparent bg-revision-e text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
