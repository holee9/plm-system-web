"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Clock } from "lucide-react";
import { KanbanColumn, type IssueStatus } from "./kanban-column";
import { IssueCard, type Issue } from "./issue-card";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ViewMode = "board" | "list" | "timeline";

interface KanbanBoardProps {
  issues: Issue[];
  onIssueMove?: (issueId: string, newStatus: IssueStatus) => void;
  onIssueClick?: (issue: Issue) => void;
  onCreateIssue?: () => void;
  onViewChange?: (view: ViewMode) => void;
  currentView?: ViewMode;
}

// Group issues by status
function groupIssuesByStatus(issues: Issue[]): Record<IssueStatus, Issue[]> {
  return {
    todo: issues.filter((issue) => issue.status === "todo"),
    inProgress: issues.filter((issue) => issue.status === "inProgress"),
    inReview: issues.filter((issue) => issue.status === "inReview"),
    done: issues.filter((issue) => issue.status === "done"),
  };
}

export function KanbanBoard({
  issues,
  onIssueMove,
  onIssueClick,
  onCreateIssue,
  onViewChange,
  currentView = "board",
}: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const groupedIssues = groupIssuesByStatus(issues);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, args) => {
        // Custom keyboard coordinate getter if needed
        const { currentCoordinates } = args;
        return {
          x: currentCoordinates.x,
          y: currentCoordinates.y,
        };
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find((i) => i.id === active.id);
    if (issue) {
      setActiveIssue(issue);
    }
  };

  // Handle drag over for column highlighting
  const handleDragOver = (event: DragOverEvent) => {
    // Can be used for column highlighting during drag
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const issueId = active.id as string;
    const columnId = over.id as IssueStatus;

    // Check if dropped on a different column
    const issue = issues.find((i) => i.id === issueId);
    if (issue && issue.status !== columnId) {
      onIssueMove?.(issueId, columnId);
    }
  };

  const columns: IssueStatus[] = ["todo", "inProgress", "inReview", "done"];

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        {/* View Toggle */}
        <div className="flex items-center bg-secondary rounded-lg p-1">
          {[
            { value: "board" as ViewMode, icon: LayoutGrid, label: "Board" },
            { value: "list" as ViewMode, icon: List, label: "List" },
            { value: "timeline" as ViewMode, icon: Clock, label: "Timeline" },
          ].map((view) => (
            <button
              key={view.value}
              onClick={() => onViewChange?.(view.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                currentView === view.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <view.icon className="h-4 w-4" />
              {view.label}
            </button>
          ))}
        </div>

        {/* Create Issue Button */}
        <Button onClick={onCreateIssue} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Issue
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((columnId) => (
            <div
              key={columnId}
              className="flex-shrink-0 w-[300px]"
              style={{ minWidth: "270px" }}
            >
              <KanbanColumn
                id={columnId}
                issues={groupedIssues[columnId]}
                onIssueClick={onIssueClick}
              />
            </div>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeIssue ? <IssueCard issue={activeIssue} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
