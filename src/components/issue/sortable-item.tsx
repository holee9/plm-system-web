import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IssueCard, type Issue } from "./issue-card";
import { cn } from "@/lib/utils";

interface SortableItemProps {
  issue: Issue;
  onIssueClick?: (issue: Issue) => void;
}

export function SortableItem({ issue, onIssueClick }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: issue.id,
      data: issue,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IssueCard issue={issue} isDragging={isDragging} onClick={() => onIssueClick?.(issue)} />
    </div>
  );
}
