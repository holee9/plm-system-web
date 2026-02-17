"use client";

import { useState } from "react";
import { toast } from "sonner";
import { skipToken } from "@tanstack/react-query";

import { KanbanBoard } from "./kanban-board";
import { IssueCreateDialog } from "./issue-create-dialog";
import { IssueDetailDialog } from "./issue-detail-dialog";
import { IssueFilters } from "./issue-filters";
import type { IssueCardData } from "./issue-card";
import type { IssueStatus } from "~/modules/issue/types";
import { trpc } from "@/lib/trpc";

interface IssueBoardProps {
  projectId?: string;
  currentUserId?: string;
}

export function IssueBoard({ projectId, currentUserId }: IssueBoardProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(undefined);

  // Filters
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<"urgent" | "high" | "medium" | "low" | "none" | undefined>();
  const [statusFilter, setStatusFilter] = useState<"open" | "in_progress" | "review" | "done" | "closed" | undefined>();
  const [typeFilter, setTypeFilter] = useState<"task" | "bug" | "feature" | "improvement" | undefined>();
  const [milestoneFilter, setMilestoneFilter] = useState<string | null | undefined>();

  // Fetch issues
  const { data: issuesData, isLoading } = trpc.issue.list.useQuery(
    projectId ? {
      projectId: projectId,
      filters: {
        assigneeId: onlyMyIssues ? currentUserId : undefined,
        priority: priorityFilter,
        status: statusFilter,
        type: typeFilter,
      },
    } : skipToken,
    { enabled: !!projectId }
  );

  const issues = issuesData?.items ?? [];

  // Update issue mutation
  const utils = trpc.useUtils();
  const updateIssueStatus = trpc.issue.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Issue status updated");
      utils.issue.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update issue");
    },
  });

  // Handle issue move
  const handleIssueMove = (issueId: string, newStatus: IssueStatus) => {
    updateIssueStatus.mutate({
      id: issueId,
      data: { status: newStatus },
    });
  };

  // Handle issue click
  const handleIssueClick = (issue: IssueCardData) => {
    setSelectedIssueId(issue.id);
  };

  // Clear filters
  const handleClearFilters = () => {
    setOnlyMyIssues(false);
    setPriorityFilter(undefined);
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    setMilestoneFilter(undefined);
  };

  // Convert database issues to component format
  const formattedIssues: IssueCardData[] = issues.map((issue: any) => ({
    id: issue.id,
    key: issue.key,
    title: issue.title,
    type: issue.type as IssueCardData["type"],
    priority: issue.priority as IssueCardData["priority"],
    status: issue.status, // Already matches backend IssueStatus type
    assignee: issue.assigneeId
      ? {
          name: "Assigned User", // TODO: Fetch from users table
          initials: "AU",
        }
      : undefined,
    labels: issue.labels as string[] | undefined,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  }));

  return (
    <div className="flex flex-col h-full gap-6">
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
        milestoneId={milestoneFilter}
        onMilestoneIdChange={setMilestoneFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading issues...</div>
        </div>
      ) : (
        <KanbanBoard
          issues={formattedIssues}
          onIssueMove={handleIssueMove}
          onIssueClick={handleIssueClick}
          onCreateIssue={() => setIsCreateDialogOpen(true)}
        />
      )}

      {/* Create Issue Dialog */}
      <IssueCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        onSuccess={() => {
          utils.issue.list.invalidate();
        }}
      />

      {/* Issue Detail Dialog */}
      <IssueDetailDialog
        open={!!selectedIssueId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIssueId(undefined);
          }
        }}
        issueId={selectedIssueId}
        onSuccess={() => {
          utils.issue.list.invalidate();
        }}
      />
    </div>
  );
}
