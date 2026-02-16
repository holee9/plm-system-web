import { FileText, FileCheck, ClipboardCopy } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

export type ChangeRequestType = "ECR" | "ECO" | "ECN";

export interface ChangeRequest {
  id: string;
  type: ChangeRequestType;
  title: string;
  status: "pending" | "approved" | "released" | "implemented" | "rejected";
  createdAt: string;
  createdBy?: string;
}

interface ChangeHistoryProps {
  changes: ChangeRequest[];
  onChangeClick?: (change: ChangeRequest) => void;
  className?: string;
}

const changeTypeConfig = {
  ECR: {
    label: "ECR",
    icon: FileText,
    description: "Engineering Change Request",
  },
  ECO: {
    label: "ECO",
    icon: FileCheck,
    description: "Engineering Change Order",
  },
  ECN: {
    label: "ECN",
    icon: ClipboardCopy,
    description: "Engineering Change Notice",
  },
};

const changeStatusMap: Record<
  ChangeRequest["status"],
  "released" | "approved" | "pending" | "draft"
> = {
  pending: "pending",
  approved: "approved",
  released: "released",
  implemented: "released",
  rejected: "draft",
};

export function ChangeHistory({
  changes,
  onChangeClick,
  className,
}: ChangeHistoryProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {changes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No changes yet</p>
        </div>
      ) : (
        changes.map((change) => {
          const config = changeTypeConfig[change.type];
          const Icon = config.icon;
          const statusBadge = changeStatusMap[change.status];

          return (
            <button
              key={change.id}
              onClick={() => onChangeClick?.(change)}
              className={cn(
                "w-full flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3 text-left",
                "transition-colors hover:bg-muted/50 hover:border-border",
                onChangeClick && "cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                  change.type === "ECR" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  change.type === "ECO" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                  change.type === "ECN" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                )}
              >
                {config.label}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{change.id}</p>
                  <StatusBadge status={statusBadge} />
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {change.title}
                </p>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
