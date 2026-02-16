"use client";

import { useState } from "react";
import { KanbanBoard, type Issue, type IssueStatus } from "@/components/issue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Mock issues data
const mockIssues: Issue[] = [
  {
    id: "1",
    key: "PLM-144",
    title: "Fix battery thermal management",
    type: "bug",
    priority: "critical",
    status: "todo",
    assignee: {
      name: "John Doe",
      initials: "JD",
    },
    labels: ["battery", "thermal"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    key: "PLM-145",
    title: "Implement BOM versioning",
    type: "story",
    priority: "high",
    status: "todo",
    assignee: {
      name: "Jane Smith",
      initials: "JS",
    },
    labels: ["bom", "versioning"],
    createdAt: "2024-01-14",
    updatedAt: "2024-01-14",
  },
  {
    id: "3",
    key: "PLM-146",
    title: "Update part number validation",
    type: "task",
    priority: "low",
    status: "todo",
    assignee: {
      name: "Bob Johnson",
      initials: "BJ",
    },
    createdAt: "2024-01-13",
    updatedAt: "2024-01-13",
  },
  {
    id: "4",
    key: "PLM-140",
    title: "Implement BOM versioning",
    type: "story",
    priority: "high",
    status: "inProgress",
    assignee: {
      name: "Alice Brown",
      initials: "AB",
    },
    labels: ["bom"],
    createdAt: "2024-01-12",
    updatedAt: "2024-01-15",
  },
  {
    id: "5",
    key: "PLM-141",
    title: "Add ECN workflow",
    type: "epic",
    priority: "medium",
    status: "inProgress",
    assignee: {
      name: "Charlie Wilson",
      initials: "CW",
    },
    createdAt: "2024-01-11",
    updatedAt: "2024-01-14",
  },
  {
    id: "6",
    key: "PLM-138",
    title: "Fix part search performance",
    type: "bug",
    priority: "low",
    status: "inReview",
    assignee: {
      name: "Diana Lee",
      initials: "DL",
    },
    labels: ["performance", "search"],
    createdAt: "2024-01-10",
    updatedAt: "2024-01-13",
  },
  {
    id: "7",
    key: "PLM-137",
    title: "Implement user permissions",
    type: "story",
    priority: "low",
    status: "done",
    assignee: {
      name: "Eve Davis",
      initials: "ED",
    },
    createdAt: "2024-01-09",
    updatedAt: "2024-01-12",
  },
  {
    id: "8",
    key: "PLM-136",
    title: "Add export to PDF",
    type: "task",
    priority: "medium",
    status: "done",
    assignee: {
      name: "Frank Miller",
      initials: "FM",
    },
    labels: ["export", "pdf"],
    createdAt: "2024-01-08",
    updatedAt: "2024-01-11",
  },
];

export default function IssuePage() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "list" | "timeline">("board");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Handle issue move between columns
  const handleIssueMove = (issueId: string, newStatus: IssueStatus) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus, updatedAt: new Date().toISOString() } : issue
      )
    );
  };

  // Handle issue click
  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  // Handle create issue
  const handleCreateIssue = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your project issues
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        issues={issues}
        onIssueMove={handleIssueMove}
        onIssueClick={handleIssueClick}
        onCreateIssue={handleCreateIssue}
        onViewChange={setViewMode}
        currentView={viewMode}
      />

      {/* Issue Detail Dialog */}
      {selectedIssue && (
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div>
                  <DialogTitle className="text-lg">{selectedIssue.key}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">{selectedIssue.title}</p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <p className="text-sm font-medium capitalize mt-1">{selectedIssue.type}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <p className="text-sm font-medium capitalize mt-1">{selectedIssue.priority}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className="text-sm font-medium capitalize mt-1">
                    {selectedIssue.status === "inProgress" ? "In Progress" :
                     selectedIssue.status === "inReview" ? "In Review" :
                     selectedIssue.status.charAt(0).toUpperCase() + selectedIssue.status.slice(1)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Assignee</Label>
                  <p className="text-sm font-medium mt-1">{selectedIssue.assignee?.name || "Unassigned"}</p>
                </div>
              </div>

              {selectedIssue.labels && selectedIssue.labels.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Labels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedIssue.labels.map((label) => (
                      <span
                        key={label}
                        className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <Label>Created</Label>
                  <p>{new Date(selectedIssue.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Updated</Label>
                  <p>{new Date(selectedIssue.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Issue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter issue title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter issue description" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="jane">Jane Smith</SelectItem>
                  <SelectItem value="bob">Bob Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Issue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
