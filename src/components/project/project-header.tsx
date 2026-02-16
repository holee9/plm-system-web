"use client";

import * as React from "react";
import { Calendar, Users, TrendingUp, Settings, Edit, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProjectHeaderProps {
  title: string;
  key: string;
  status: "Not Started" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
  dateRange: string;
  memberCount: number;
  progress: number;
  onEdit?: () => void;
  onAddIssue?: () => void;
}

const statusColors: Record<
  ProjectHeaderProps["status"],
  { bg: string; text: string; border: string }
> = {
  "Not Started": { bg: "bg-gray-500/15", text: "text-gray-700 dark:text-gray-300", border: "border-gray-500/30" },
  "In Progress": { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500/30" },
  "On Hold": { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/30" },
  "Completed": { bg: "bg-green-500/15", text: "text-green-700 dark:text-green-300", border: "border-green-500/30" },
  "Cancelled": { bg: "bg-red-500/15", text: "text-red-700 dark:text-red-300", border: "border-red-500/30" },
};

export function ProjectHeader({
  title,
  key: projectKey,
  status,
  dateRange,
  memberCount,
  progress,
  onEdit,
  onAddIssue,
}: ProjectHeaderProps) {
  const statusColor = statusColors[status];

  return (
    <div className="border-b border-border bg-card">
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Left: Title and Metadata */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{projectKey}</p>
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{dateRange}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{memberCount} members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>{progress}% complete</span>
              </div>
            </div>

            {/* Status Badge */}
            <Badge
              variant="outline"
              className={cn("text-sm font-normal px-2.5 py-0.5", statusColor.bg, statusColor.text, statusColor.border)}
            >
              {status}
            </Badge>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            )}
            {onAddIssue && (
              <Button size="sm" onClick={onAddIssue}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Issue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
