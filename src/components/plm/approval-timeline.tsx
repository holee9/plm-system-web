import { Check, Circle, Loader2, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ApprovalStepStatus = "completed" | "in-progress" | "pending" | "skipped";

export interface ApprovalStep {
  id: string;
  name: string;
  status: ApprovalStepStatus;
  date?: string;
  approver?: string;
  avatar?: string;
  comments?: string;
}

interface ApprovalTimelineProps {
  steps: ApprovalStep[];
  onStepClick?: (step: ApprovalStep) => void;
  className?: string;
}

export function ApprovalTimeline({
  steps,
  onStepClick,
  className,
}: ApprovalTimelineProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIcon = (status: ApprovalStepStatus) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4" />;
      case "in-progress":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "pending":
        return <Circle className="h-4 w-4" />;
      case "skipped":
        return <Circle className="h-4 w-4 fill-none" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ApprovalStepStatus) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "in-progress":
        return "bg-info text-info-foreground";
      case "pending":
        return "bg-muted text-muted-foreground";
      case "skipped":
        return "bg-muted text-muted-foreground opacity-50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLineColor = (index: number, status: ApprovalStepStatus) => {
    if (status === "completed") {
      return "bg-success";
    }
    if (status === "in-progress") {
      return "bg-info";
    }
    return "bg-border";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isClickable = onStepClick && step.status !== "pending";

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center flex-1",
                isClickable && "cursor-pointer group"
              )}
              onClick={() => isClickable && onStepClick(step)}
            >
              <div className="flex flex-col items-center w-full">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 border-background shadow-sm transition-colors",
                    getStatusColor(step.status),
                    isClickable && "group-hover:scale-110 transition-transform"
                  )}
                >
                  {step.status === "pending" ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    getStatusIcon(step.status)
                  )}
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      "h-0.5 w-full mt-4 transition-colors",
                      getLineColor(index, step.status)
                    )}
                  />
                )}
              </div>

              <div className="mt-3 text-center w-full px-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.status === "pending" && "text-muted-foreground"
                  )}
                >
                  {step.name}
                </p>

                {step.approver && (
                  <div className="flex items-center justify-center mt-2 gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {step.avatar || getInitials(step.approver)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      {step.approver}
                    </p>
                  </div>
                )}

                {step.date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(step.date).toLocaleDateString()}
                  </p>
                )}

                {step.comments && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {step.comments}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
