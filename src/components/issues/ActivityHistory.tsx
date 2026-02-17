"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import {
  ChevronDown,
  GitCommit,
  MessageSquare,
  Paperclip,
  Tag,
  User,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// Activity types
export type ActivityType =
  | "issue_created"
  | "issue_updated"
  | "status_changed"
  | "assignee_changed"
  | "label_added"
  | "label_removed"
  | "comment_added"
  | "attachment_added"
  | "attachment_removed"
  | "milestone_changed"
  | "priority_changed";

export interface IssueActivity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userInitials: string;
  createdAt: Date | string;
  details?: {
    oldValue?: string;
    newValue?: string;
    fieldName?: string;
  };
  metadata?: Record<string, unknown>;
}

interface ActivityHistoryProps {
  activities: IssueActivity[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Get activity icon based on type
function getActivityIcon(type: ActivityType): React.ReactNode {
  switch (type) {
    case "issue_created":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "issue_updated":
      return <Settings className="h-4 w-4 text-blue-500" />;
    case "status_changed":
      return <GitCommit className="h-4 w-4 text-purple-500" />;
    case "assignee_changed":
      return <User className="h-4 w-4 text-orange-500" />;
    case "label_added":
    case "label_removed":
      return <Tag className="h-4 w-4 text-pink-500" />;
    case "comment_added":
      return <MessageSquare className="h-4 w-4 text-cyan-500" />;
    case "attachment_added":
    case "attachment_removed":
      return <Paperclip className="h-4 w-4 text-amber-500" />;
    case "milestone_changed":
      return <AlertCircle className="h-4 w-4 text-indigo-500" />;
    case "priority_changed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <GitCommit className="h-4 w-4 text-muted-foreground" />;
  }
}

// Get activity description based on type
function getActivityDescription(activity: IssueActivity): string {
  const { type, userName, details } = activity;

  switch (type) {
    case "issue_created":
      return `${userName}님이 이슈를 생성했습니다`;
    case "issue_updated":
      return `${userName}님이 이슈를 수정했습니다`;
    case "status_changed":
      return `${userName}님이 상태를 "${details?.oldValue}"에서 "${details?.newValue}"(으)로 변경했습니다`;
    case "assignee_changed":
      if (!details?.newValue) {
        return `${userName}님이 담당자를 할당 해제했습니다`;
      }
      return `${userName}님이 담당자를 "${details.newValue}"(으)로 변경했습니다`;
    case "label_added":
      return `${userName}님이 라벨 "${details?.newValue}"을(를) 추가했습니다`;
    case "label_removed":
      return `${userName}님이 라벨 "${details?.oldValue}"을(를) 제거했습니다`;
    case "comment_added":
      return `${userName}님이 댓글을 작성했습니다`;
    case "attachment_added":
      return `${userName}님이 파일 "${details?.fileName}"을(를) 첨부했습니다`;
    case "attachment_removed":
      return `${userName}님이 파일 "${details?.fileName}"을(를) 삭제했습니다`;
    case "milestone_changed":
      if (!details?.newValue) {
        return `${userName}님이 마일스톤을 제거했습니다`;
      }
      return `${userName}님이 마일스톤을 "${details.newValue}"(으)로 설정했습니다`;
    case "priority_changed":
      return `${userName}님이 우선순위를 "${details?.oldValue}"에서 "${details?.newValue}"(으)로 변경했습니다`;
    default:
      return `${userName}님이 활동을 했습니다`;
  }
}

// Loading skeleton for activity items
function ActivitySkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function ActivityHistory({
  activities,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}: ActivityHistoryProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">활동 히스토리</h3>
        <div className="space-y-6">
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">활동 히스토리</h3>
        <p className="text-center text-muted-foreground py-8">
          아직 활동 내역이 없습니다
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">활동 히스토리</h3>

      <div className="space-y-6">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

        {activities.map((activity, index) => {
          const isExpanded = expandedItems.has(activity.id);
          const showTimestamp =
            index === 0 ||
            new Date(activity.createdAt).getTime() -
              new Date(activities[index - 1].createdAt).getTime() >
              5 * 60 * 1000; // 5 minutes

          return (
            <div key={activity.id} className="relative flex gap-3">
              {/* Timeline Icon */}
              <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-background border border-border">
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0 pb-2">
                {/* User and Time */}
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {activity.userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {activity.userName}
                  </span>
                  {showTimestamp && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </>
                  )}
                </div>

                {/* Activity Description */}
                <p className="text-sm text-muted-foreground">
                  {getActivityDescription(activity)}
                </p>

                {/* Expandable Details */}
                {activity.details && (activity.details.oldValue || activity.details.newValue) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 px-2 text-xs"
                    onClick={() => toggleExpand(activity.id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        접기
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1 rotate-[-90deg]" />
                        펼치기
                      </>
                    )}
                  </Button>
                )}

                {isExpanded && activity.details && (
                  <Card className="mt-2 p-3 bg-muted/50">
                    <div className="text-xs space-y-1">
                      {activity.details.fieldName && (
                        <div className="font-medium">
                          필드: {activity.details.fieldName}
                        </div>
                      )}
                      {activity.details.oldValue && (
                        <div className="text-destructive">
                          이전: {activity.details.oldValue}
                        </div>
                      )}
                      {activity.details.newValue && (
                        <div className="text-green-600">
                          새로운: {activity.details.newValue}
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="mt-6 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={onLoadMore}
          >
            더 보기
          </Button>
        </div>
      )}
    </Card>
  );
}
