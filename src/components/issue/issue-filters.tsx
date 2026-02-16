"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export type IssuePriority = "critical" | "high" | "medium" | "low" | undefined;
export type IssueStatus = "todo" | "inProgress" | "inReview" | "done" | undefined;
export type IssueType = "bug" | "story" | "task" | "epic" | undefined;

interface IssueFiltersProps {
  onlyMyIssues: boolean;
  onOnlyMyIssuesChange: (value: boolean) => void;
  priority?: IssuePriority;
  onPriorityChange: (value: IssuePriority) => void;
  status?: IssueStatus;
  onStatusChange: (value: IssueStatus) => void;
  type?: IssueType;
  onTypeChange: (value: IssueType) => void;
  projectId?: string;
  onProjectIdChange: (value: string | undefined) => void;
  projects?: Array<{ id: string; name: string }>;
  onClearFilters: () => void;
  className?: string;
}

export function IssueFilters({
  onlyMyIssues,
  onOnlyMyIssuesChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  projectId,
  onProjectIdChange,
  projects = [],
  onClearFilters,
  className,
}: IssueFiltersProps) {
  const hasActiveFilters =
    onlyMyIssues || priority || status || type || projectId;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Only My Issues */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="only-my-issues"
          checked={onlyMyIssues}
          onCheckedChange={(checked) => onOnlyMyIssuesChange(checked === true)}
        />
        <Label
          htmlFor="only-my-issues"
          className="text-sm font-normal cursor-pointer"
        >
          Only My Issues
        </Label>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Priority Filter */}
      <Select
        value={priority || "all"}
        onValueChange={(value) =>
          onPriorityChange(value === "all" ? undefined : (value as IssuePriority))
        }
      >
        <SelectTrigger className="w-[140px]">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={status || "all"}
        onValueChange={(value) =>
          onStatusChange(value === "all" ? undefined : (value as IssueStatus))
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="inProgress">In Progress</SelectItem>
          <SelectItem value="inReview">In Review</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select
        value={type || "all"}
        onValueChange={(value) =>
          onTypeChange(value === "all" ? undefined : (value as IssueType))
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="bug">Bug</SelectItem>
          <SelectItem value="story">Story</SelectItem>
          <SelectItem value="task">Task</SelectItem>
          <SelectItem value="epic">Epic</SelectItem>
        </SelectContent>
      </Select>

      {/* Project Filter */}
      {projects.length > 0 && (
        <Select
          value={projectId || "all"}
          onValueChange={(value) =>
            onProjectIdChange(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
