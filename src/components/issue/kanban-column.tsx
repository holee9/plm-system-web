import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IssueCard, type Issue } from "./issue-card";
import { SortableItem } from "./sortable-item";
import { cn } from "@/lib/utils";

// Status colors from design tokens
const STATUS_CONFIG = {
  todo: {
    label: "To Do",
    color: "#71717a",
    bgColor: "#e4e4e7",
  },
  inProgress: {
    label: "In Progress",
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  inReview: {
    label: "In Review",
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  done: {
    label: "Done",
    color: "#22c55e",
    bgColor: "#dcfce7",
  },
} as const;

export type IssueStatus = keyof typeof STATUS_CONFIG;

interface KanbanColumnProps {
  id: IssueStatus;
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
}

export function KanbanColumn({ id, issues, onIssueClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      status: id,
    },
  });

  const config = STATUS_CONFIG[id];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-lg border transition-colors",
        isOver && "ring-2 ring-ring ring-offset-2"
      )}
      style={{
        backgroundColor: config.bgColor,
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card rounded-t-lg border-b">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <h3 className="text-sm font-semibold text-card-foreground">
            {config.label}
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {issues.length}
        </span>
      </div>

      {/* Issue List */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-280px)]">
        <SortableContext
          items={issues.map((issue) => issue.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <SortableItem
              key={issue.id}
              issue={issue}
              onIssueClick={onIssueClick}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {issues.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground italic">
            No issues
          </div>
        )}
      </div>
    </div>
  );
}
