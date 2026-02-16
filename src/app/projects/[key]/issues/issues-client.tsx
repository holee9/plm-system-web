"use client";

import { useState } from "react";
import { IssueList } from "@/components/issue/issue-list";
import { IssueFilters } from "@/components/issue/issue-filters";
import { trpc } from "@/lib/trpc";
import type { IssueStatus, IssuePriority, IssueType } from "~/modules/issue/types";

interface IssueBoardWithListProps {
  projectId: string;
  projectKey: string;
}

export function IssueBoardWithList({ projectId, projectKey }: IssueBoardWithListProps) {
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | undefined>();
  const [statusFilter, setStatusFilter] = useState<IssueStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<IssueType | undefined>();

  // TODO: Get currentUserId from auth context
  const currentUserId = undefined;

  // Fetch issues
  const { data: issuesData, isLoading } = trpc.issue.list.useQuery(
    {
      projectId,
      filters: {
        assigneeId: onlyMyIssues ? currentUserId : undefined,
        priority: priorityFilter,
        status: statusFilter,
        type: typeFilter,
      },
    },
    { enabled: !!projectId }
  );

  const issues = issuesData?.items ?? [];

  // Clear filters
  const handleClearFilters = () => {
    setOnlyMyIssues(false);
    setPriorityFilter(undefined);
    setStatusFilter(undefined);
    setTypeFilter(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <IssueFilters
        onlyMyIssues={onlyMyIssues}
        onOnlyMyIssuesChange={setOnlyMyIssues}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        type={typeFilter}
        onTypeChange={setTypeFilter}
        projectId={projectId}
        onProjectIdChange={() => {}}
        onClearFilters={handleClearFilters}
      />

      {/* Issue List */}
      <IssueList
        issues={issues.map((issue: any) => ({
          ...issue,
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
        }))}
        projectKey={projectKey}
        isLoading={isLoading}
      />
    </div>
  );
}
