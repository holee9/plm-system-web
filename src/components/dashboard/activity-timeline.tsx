"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Clock,
  FileText,
  UserPlus,
  Settings,
  GitCommit,
  CheckCircle,
  AlertTriangle,
  Package,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Activity event types
 */
export type ActivityEventType =
  | "part_created"
  | "part_updated"
  | "part_deleted"
  | "change_order_created"
  | "change_order_approved"
  | "change_order_rejected"
  | "change_order_implemented"
  | "project_created"
  | "member_added"
  | "document_uploaded"
  | "bom_updated"
  | "system_alert";

/**
 * Activity timeline entry
 */
export interface ActivityEntry {
  id: string;
  type: ActivityEventType;
  title: string;
  description?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  link?: string;
}

/**
 * Activity timeline component props
 */
interface ActivityTimelineProps {
  /** Array of activity entries */
  activities: ActivityEntry[];
  /** Optional title */
  title?: string;
  /** Optional max height */
  maxHeight?: string;
  /** Show empty state */
  showEmpty?: boolean;
  /** Maximum entries to display */
  maxEntries?: number;
  /** Optional className */
  className?: string;
}

/**
 * Event type configuration
 */
const eventTypeConfig: Record<
  ActivityEventType,
  { icon: typeof Clock; color: string; bgColor: string; label: string }
> = {
  part_created: {
    icon: Package,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    label: "부품 생성",
  },
  part_updated: {
    icon: Settings,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    label: "부품 수정",
  },
  part_deleted: {
    icon: Package,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950",
    label: "부품 삭제",
  },
  change_order_created: {
    icon: FileText,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    label: "변경 요청 생성",
  },
  change_order_approved: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    label: "변경 요청 승인",
  },
  change_order_rejected: {
    icon: AlertTriangle,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950",
    label: "변경 요청 거부",
  },
  change_order_implemented: {
    icon: GitCommit,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    label: "변경 사항 구현",
  },
  project_created: {
    icon: FileText,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    label: "프로젝트 생성",
  },
  member_added: {
    icon: UserPlus,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    label: "멤버 추가",
  },
  document_uploaded: {
    icon: FileText,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950",
    label: "문서 업로드",
  },
  bom_updated: {
    icon: Settings,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    label: "BOM 수정",
  },
  system_alert: {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    label: "시스템 알림",
  },
};

/**
 * Get user initials from name
 */
function getUserInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * ActivityTimeline Component
 * @description A vertical timeline display of recent activities
 */
export function ActivityTimeline({
  activities,
  title = "최근 활동",
  maxHeight = "400px",
  showEmpty = true,
  maxEntries,
  className,
}: ActivityTimelineProps) {
  const displayActivities = maxEntries
    ? activities.slice(0, maxEntries)
    : activities;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activities.length}개 활동
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {displayActivities.length === 0 ? (
          showEmpty ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                표시할 활동이 없습니다
              </p>
            </div>
          ) : null
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="p-6">
              <div className="space-y-6">
                {displayActivities.map((entry, index) => {
                  const config = eventTypeConfig[entry.type];
                  const Icon = config.icon;
                  const isLast = index === displayActivities.length - 1;

                  return (
                    <div key={entry.id} className="flex gap-4">
                      {/* Timeline line and icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2",
                            config.bgColor,
                            entry.type.includes("alert") ||
                              entry.type.includes("rejected") ||
                              entry.type.includes("deleted")
                              ? "border-destructive"
                              : "border-primary"
                          )}
                        >
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        {!isLast && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{entry.title}</p>
                            {entry.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                {entry.description}
                              </p>
                            )}

                            {/* User and time */}
                            <div className="flex items-center gap-3 mt-2">
                              {entry.userName && (
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs">
                                      {getUserInitials(entry.userName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    {entry.userName}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(entry.timestamp), {
                                  addSuffix: true,
                                  locale: ko,
                                })}
                              </span>
                            </div>

                            {/* Metadata badges */}
                            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {Object.entries(entry.metadata)
                                  .slice(0, 3)
                                  .map(([key, value]) => (
                                    <Badge
                                      key={key}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {key}: {String(value)}
                                    </Badge>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* Link button */}
                          {entry.link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              asChild
                            >
                              <a href={entry.link}>
                                <FileText className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact activity feed (horizontal cards)
 */
interface ActivityFeedProps {
  activities: ActivityEntry[];
  maxItems?: number;
  className?: string;
}

export function ActivityFeed({
  activities,
  maxItems = 5,
  className,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-sm text-muted-foreground">
          최근 활동이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {displayActivities.map((entry) => {
        const config = eventTypeConfig[entry.type];
        const Icon = config.icon;

        return (
          <div
            key={entry.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50",
              config.bgColor.replace("/95", "/20")
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                config.bgColor
              )}
            >
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{entry.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(entry.timestamp), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>
          </div>
        );
      })}

      {activities.length > maxItems && (
        <Button variant="outline" size="sm" className="w-full">
          모든 활동 보기 ({activities.length})
        </Button>
      )}
    </div>
  );
}

/**
 * Activity summary by type
 */
interface ActivitySummaryProps {
  activities: ActivityEntry[];
  className?: string;
}

export function ActivitySummary({
  activities,
  className,
}: ActivitySummaryProps) {
  // Group activities by type
  const groupedByType = activities.reduce((acc, activity) => {
    const key = activity.type;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summary = Object.entries(groupedByType)
    .map(([type, count]) => ({
      type: type as ActivityEventType,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  if (summary.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {summary.map(({ type, count }) => {
        const config = eventTypeConfig[type];
        const Icon = config.icon;

        return (
          <Badge key={type} variant="secondary" className="gap-1.5">
            <Icon className={cn("h-3 w-3", config.color)} />
            <span>{config.label}</span>
            <span className="text-muted-foreground">{count}</span>
          </Badge>
        );
      })}
    </div>
  );
}
