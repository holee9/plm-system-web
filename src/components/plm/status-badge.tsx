import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      status: {
        released: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
        "in-progress":
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        implemented:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status?: "released" | "approved" | "pending" | "draft" | "in-progress" | "implemented";
}

function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ status }), className)} {...props} />
  );
}

export { StatusBadge, statusBadgeVariants };
