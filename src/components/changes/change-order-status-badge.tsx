import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ChangeOrderStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "implemented";

interface ChangeOrderStatusBadgeProps {
  status: ChangeOrderStatus;
  showLabel?: boolean;
}

const statusConfig: Record<ChangeOrderStatus, { label: string; className: string }> = {
  draft: { label: "초안", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  submitted: { label: "제출됨", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  in_review: { label: "검토 중", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  approved: { label: "승인됨", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  rejected: { label: "거부됨", className: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
  implemented: { label: "구현됨", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
};

export function ChangeOrderStatusBadge({ status, showLabel = true }: ChangeOrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  if (!showLabel) {
    return <span className={cn("h-2 w-2 rounded-full", config.className.replace(/text-\w+-\d+/g, ""))} />;
  }

  return (
    <Badge variant="secondary" className={cn("font-normal", config.className)}>
      {config.label}
    </Badge>
  );
}
