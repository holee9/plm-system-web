import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Priority colors from design tokens
const PRIORITY_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#22c55e",
} as const;

// Issue type badge colors
const ISSUE_TYPE_COLORS = {
  bug: "#ef4444",
  story: "#3b82f6",
  task: "#22c55e",
  epic: "#a855f7",
} as const;

export interface Issue {
  id: string;
  key: string;
  title: string;
  type: "bug" | "story" | "task" | "epic";
  priority: "critical" | "high" | "medium" | "low";
  status: "todo" | "inProgress" | "inReview" | "done";
  assignee?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

interface IssueCardProps {
  issue: Issue;
  isDragging?: boolean;
  onClick?: () => void;
}

export function IssueCard({ issue, isDragging, onClick }: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: issue.id,
    data: issue,
  });

  const priorityColor = PRIORITY_COLORS[issue.priority];
  const typeColor = ISSUE_TYPE_COLORS[issue.type];

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        borderLeftColor: priorityColor,
      }
    : { borderLeftColor: priorityColor };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={cn(
        "group relative bg-card rounded-md shadow-sm p-3 cursor-grab",
        "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        "border-l-4",
        isDragging && "opacity-50 cursor-grabbing"
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Issue Key */}
      <div className="text-xs text-muted-foreground font-medium mb-1">
        {issue.key}
      </div>

      {/* Issue Title */}
      <div className="text-sm font-medium text-foreground leading-snug mb-3">
        {issue.title}
      </div>

      {/* Meta Information */}
      <div className="flex items-center justify-between gap-2">
        {/* Issue Type Badge */}
        <Badge
          variant="outline"
          className="text-xs font-normal py-0 px-2 h-5"
          style={{
            borderColor: typeColor,
            color: typeColor,
          }}
        >
          {issue.type}
        </Badge>

        {/* Assignee Avatar */}
        {issue.assignee && (
          <Avatar className="h-6 w-6">
            {issue.assignee.avatar ? (
              <img src={issue.assignee.avatar} alt={issue.assignee.name} />
            ) : (
              <AvatarFallback className="text-xs">
                {issue.assignee.initials}
              </AvatarFallback>
            )}
          </Avatar>
        )}
      </div>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {issue.labels.slice(0, 2).map((label) => (
            <span
              key={label}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
            >
              {label}
            </span>
          ))}
          {issue.labels.length > 2 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              +{issue.labels.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
