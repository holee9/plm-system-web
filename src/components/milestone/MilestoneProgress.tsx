"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue";

interface MilestoneProgressProps {
  milestones: Array<{
    id: string;
    title: string;
    status: MilestoneStatus;
    progress: number;
    dueDate: string;
  }>;
}

export function MilestoneProgress({ milestones }: MilestoneProgressProps) {
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const overallProgress = milestones.length > 0
    ? Math.round((completedCount / milestones.length) * 100)
    : 0;

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: MilestoneStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="text-muted-foreground">
            {completedCount} of {milestones.length} milestones
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="text-right text-sm font-medium">{overallProgress}%</div>
      </div>

      {/* Milestone List */}
      <div className="space-y-2">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <div className="shrink-0">
              {getStatusIcon(milestone.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm truncate">{milestone.title}</span>
                <Badge variant={getStatusBadgeVariant(milestone.status)} className="text-xs capitalize">
                  {milestone.status.replace("_", " ")}
                </Badge>
              </div>
              <Progress value={milestone.progress} className="h-1" />
            </div>
            <div className="text-xs text-muted-foreground shrink-0">
              {new Date(milestone.dueDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
