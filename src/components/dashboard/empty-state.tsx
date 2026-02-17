import { LucideIcon, Inbox, Search, Bell, FileText, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * EmptyState component props
 * @description Props for displaying an empty state with optional action button
 */
interface EmptyStateProps {
  /** Icon to display in the empty state */
  icon: LucideIcon;
  /** Main heading text */
  title: string;
  /** Optional descriptive text */
  description?: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Optional action button click handler */
  onAction?: () => void;
  /** Optional button variant */
  actionVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  /** Optional additional className */
  className?: string;
}

/**
 * EmptyState Component
 * @description A reusable empty state component for displaying when no data is available
 * Used in dashboards, lists, and other container components
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {/* Icon with subtle background */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {/* Optional description */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      )}

      {/* Optional action button */}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant={actionVariant}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Preset empty states for common use cases
 */
export const EmptyStatePresets = {
  /** Empty state for no items */
  noItems: (props: Omit<EmptyStateProps, "icon">) => (
    <EmptyState
      {...props}
      icon={Inbox}
    />
  ),

  /** Empty state for no search results */
  noSearchResults: (props: Omit<EmptyStateProps, "icon">) => (
    <EmptyState
      {...props}
      icon={Search}
      title="검색 결과가 없습니다"
      description="다른 검색어를 시도하거나 필터를 조정해보세요."
    />
  ),

  /** Empty state for no notifications */
  noNotifications: (props: Omit<EmptyStateProps, "icon">) => (
    <EmptyState
      {...props}
      icon={Bell}
      title="알림이 없습니다"
      description="새로운 알림이 여기에 표시됩니다."
    />
  ),

  /** Empty state for no documents */
  noDocuments: (props: Omit<EmptyStateProps, "icon">) => (
    <EmptyState
      {...props}
      icon={FileText}
      title="문서가 없습니다"
      description="첫 번째 문서를 업로드하여 시작하세요."
      actionLabel="문서 업로드"
    />
  ),

  /** Empty state for no projects */
  noProjects: (props: Omit<EmptyStateProps, "icon">) => (
    <EmptyState
      {...props}
      icon={FolderKanban}
      title="프로젝트가 없습니다"
      description="새 프로젝트를 만들어 작업을 시작하세요."
      actionLabel="프로젝트 생성"
    />
  ),

  /** Empty state for no change orders */
  noChangeOrders: (props: Omit<EmptyStateProps, "icon">) => (
    <EmptyState
      {...props}
      icon={FileText}
      title="변경 요청이 없습니다"
      description="새 변경 요청을 생성하여 시작하세요."
      actionLabel="변경 요청 생성"
    />
  ),
};
