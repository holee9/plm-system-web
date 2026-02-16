"use client";

import { useState } from "react";
import { toast } from "sonner";

import { KanbanBoard } from "./kanban-board";
import { IssueCreateDialog } from "./issue-create-dialog";
import { IssueDetailDialog } from "./issue-detail-dialog";
import { IssueFilters } from "./issue-filters";
import type { Issue } from "./issue-card";
import type { IssueStatus } from "./kanban-column";
import { trpc } from "@/lib/trpc";

interface IssueBoardProps {
  projectId?: string;
  currentUserId?: string;
}

export function IssueBoard({ projectId, currentUserId }: IssueBoardProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | undefined>(undefined);
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(undefined);

  // Filters
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<"critical" | "high" | "medium" | "low" | undefined>();
  const [statusFilter, setStatusFilter] = useState<"todo" | "inProgress" | "inReview" | "done" | undefined>();
  const [typeFilter, setTypeFilter] = useState<"bug" | "story" | "task" | "epic" | undefined>();

  // Fetch issues
  const { data: issues = [], isLoading } = trpc.issue.list.useQuery({
    projectId,
    assigneeId: onlyMyIssues ? currentUserId : undefined,
    priority: priorityFilter,
    status: statusFilter,
    type: typeFilter,
    onlyMyIssues,
    currentUserId,
  });

  // Update issue mutation
  const utils = trpc.useUtils();
  const updateIssue = trpc.issue.update.useMutation({
    onSuccess: () => {
      toast.success("Issue updated");
      utils.issue.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update issue");
    },
  });

  // Handle issue move
  const handleIssueMove = (issueId: string, newStatus: IssueStatus) => {
    updateIssue.mutate({
      id: issueId,
      status: newStatus,
    });
  };

  // Handle issue click
  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setSelectedIssueId(issue.id);
  };

  // Clear filters
  const handleClearFilters = () => {
    setOnlyMyIssues(false);
    setPriorityFilter(undefined);
    setStatusFilter(undefined);
    setTypeFilter(undefined);
  };

  // Convert database issues to component format
  const formattedIssues: Issue[] = issues.map((issue) => ({
    id: issue.id,
    key: issue.key,
    title: issue.title,
    type: issue.type as Issue["type"],
    priority: issue.priority as Issue["priority"],
    status: issue.status as Issue["status"],
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
            setSelectedIssue(undefined);
            setSelectedIssueId(undefined);
          }
        }}
        issueId={selectedIssueId}
        issue={selectedIssue}
        onSuccess={() => {
          utils.issue.list.invalidate();
        }}
      />
    </div>
  );
}
