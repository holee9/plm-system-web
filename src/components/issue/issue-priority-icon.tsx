import { AlertCircle, ArrowDown, Minus, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IssuePriority } from "~/modules/issue/types";

interface IssuePriorityIconProps {
  priority: IssuePriority;
  className?: string;
}

const PRIORITY_CONFIG = {
  urgent: {
    icon: AlertCircle,
    label: "긴급",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  high: {
    icon: ArrowUp,
    label: "높음",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  medium: {
    icon: ArrowDown,
    label: "보통",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  low: {
    icon: ArrowDown,
    label: "낮음",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  none: {
    icon: Minus,
    label: "없음",
    color: "text-gray-400 dark:text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
  },
} as const;

export function IssuePriorityIcon({ priority, className }: IssuePriorityIconProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        config.bgColor,
        config.color,
        className
      )}
      title={config.label}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}
