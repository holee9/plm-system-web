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
import type { IssuePriority, IssueStatus, IssueType } from "~/modules/issue/types";

interface IssueFiltersProps {
  onlyMyIssues: boolean;
  onOnlyMyIssuesChange: (value: boolean) => void;
  priority?: IssuePriority | undefined;
  onPriorityChange: (value: IssuePriority | undefined) => void;
  status?: IssueStatus | undefined;
  onStatusChange: (value: IssueStatus | undefined) => void;
  type?: IssueType | undefined;
  onTypeChange: (value: IssueType | undefined) => void;
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
          내 이슈만
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
          <SelectValue placeholder="우선순위" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 우선순위</SelectItem>
          <SelectItem value="urgent">긴급</SelectItem>
          <SelectItem value="high">높음</SelectItem>
          <SelectItem value="medium">보통</SelectItem>
          <SelectItem value="low">낮음</SelectItem>
          <SelectItem value="none">없음</SelectItem>
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
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 상태</SelectItem>
          <SelectItem value="open">열림</SelectItem>
          <SelectItem value="in_progress">진행 중</SelectItem>
          <SelectItem value="review">검토 중</SelectItem>
          <SelectItem value="done">완료</SelectItem>
          <SelectItem value="closed">닫힘</SelectItem>
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
          <SelectValue placeholder="유형" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 유형</SelectItem>
          <SelectItem value="task">작업</SelectItem>
          <SelectItem value="bug">버그</SelectItem>
          <SelectItem value="feature">기능</SelectItem>
          <SelectItem value="improvement">개선</SelectItem>
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
            <SelectValue placeholder="프로젝트" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 프로젝트</SelectItem>
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
          초기화
        </Button>
      )}
    </div>
  );
}
