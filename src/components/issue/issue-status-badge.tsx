import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IssueStatus } from "~/modules/issue/types";

interface IssueStatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

const STATUS_CONFIG = {
  open: {
    label: "열림",
    color: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
  },
  in_progress: {
    label: "진행 중",
    color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  },
  review: {
    label: "검토 중",
    color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700",
  },
  done: {
    label: "완료",
    color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  },
  closed: {
    label: "닫힘",
    color: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  },
} as const;

export function IssueStatusBadge({ status, className }: IssueStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className={cn(config.color, className)}>
      {config.label}
    </Badge>
  );
}
