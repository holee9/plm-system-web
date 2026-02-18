"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Clock,
  FileText,
  GitCommit,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Import backend types for type consistency
import type { EnrichedAuditTrail } from "@/modules/plm/change-order-service";

/**
 * JSON-serializable value type for audit metadata
 * Re-exported from backend service for consistency
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Timeline event types
 */
export type TimelineEventType =
  | "created"
  | "updated"
  | "submitted"
  | "accepted_for_review"
  | "approved"
  | "rejected"
  | "implemented"
  | "comment_added";

/**
 * Timeline entry interface
 * Type alias for backend EnrichedAuditTrail for consistency
 * This ensures the component uses the same type as the backend service
 */
export type TimelineEntry = EnrichedAuditTrail;

/**
 * Timeline component props
 */
interface ChangeOrderTimelineProps {
  /** Change order ID to fetch timeline for */
  changeOrderId: string;
  /** Optional max height for scrollable area */
  maxHeight?: string;
  /** Optional max number of entries to display */
  maxEntries?: number;
  /** Optional className */
  className?: string;
  /** Whether to show the dialog with details */
  showDetails?: boolean;
}

/**
 * Convert status to event type for display
 */
function statusToEventType(status: string): TimelineEventType {
  switch (status) {
    case "draft":
      return "created";
    case "submitted":
      return "submitted";
    case "in_review":
      return "accepted_for_review";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "implemented":
      return "implemented";
    default:
      return "updated";
  }
}

/**
 * Event type configuration for display
 */
const eventTypeConfig: Record<
  TimelineEventType,
  { label: string; icon: typeof Clock; color: string; bgColor: string; borderColor: string }
> = {
  created: {
    label: "생성됨",
    icon: GitCommit,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-500",
  },
  updated: {
    label: "수정됨",
    icon: FileText,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-500",
  },
  submitted: {
    label: "제출됨",
    icon: Send,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    borderColor: "border-cyan-500",
  },
  accepted_for_review: {
    label: "검토 승인됨",
    icon: Eye,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    borderColor: "border-purple-500",
  },
  approved: {
    label: "승인됨",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    borderColor: "border-emerald-500",
  },
  rejected: {
    label: "거부됨",
    icon: XCircle,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950",
    borderColor: "border-rose-500",
  },
  implemented: {
    label: "구현됨",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-500",
  },
  comment_added: {
    label: "댓글 추가됨",
    icon: FileText,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    borderColor: "border-indigo-500",
  },
};

/**
 * ChangeOrderTimeline Component
 * @description Displays a vertical timeline of change order events
 */
export function ChangeOrderTimeline({
  changeOrderId,
  maxHeight = "400px",
  maxEntries,
  className,
  showDetails = true,
}: ChangeOrderTimelineProps) {
  // Fetch audit trail for timeline
  const { data: auditTrail, isLoading } = trpc.plm.changeOrder.auditTrail.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  const entries = (auditTrail || []).slice(0, maxEntries) as TimelineEntry[];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            타임라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            타임라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              타임라인 기록이 없습니다
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          타임라인
          <Badge variant="secondary" className="ml-auto">
            {entries.length}개 항목
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="p-6">
            <div className="space-y-6">
              {entries.map((entry, index) => {
                const eventType = statusToEventType(entry.toStatus);
                const config = eventTypeConfig[eventType] || eventTypeConfig.updated;
                const Icon = config.icon;
                const isLast = index === entries.length - 1;

                return (
                  <div key={entry.id} className="flex gap-4">
                    {/* Timeline line and icon */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2",
                          config.bgColor,
                          config.borderColor
                        )}
                      >
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>
                      {!isLast && (
                        <div className="w-0.5 flex-1 bg-border mt-2 min-h-[2rem]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{config.label}</p>
                            {entry.fromStatus !== entry.toStatus && (
                              <Badge
                                variant="outline"
                                className={cn("text-xs", config.bgColor)}
                              >
                                {entry.fromStatus} → {entry.toStatus}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>사용자 ID: {entry.changedBy.slice(0, 8)}...</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(entry.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </p>
                          {entry.comment && (
                            <p className="text-sm mt-2 bg-muted/50 p-2 rounded">
                              {entry.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Timeline detail dialog component
 */
interface TimelineDetailProps {
  entry: TimelineEntry;
  config: {
    label: string;
    icon: typeof Clock;
    color: string;
    bgColor: string;
    borderColor: string;
  };
}

function TimelineDetail({ entry, config }: TimelineDetailProps) {
  const hasDetails = entry.details || entry.comment;

  if (!hasDetails) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <AlertCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                config.bgColor
              )}
            >
              <config.icon className={cn("h-4 w-4", config.color)} />
            </div>
            {config.label}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* User info */}
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{entry.userName}</span>
            {entry.userEmail && (
              <span className="text-muted-foreground">{entry.userEmail}</span>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(entry.timestamp).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <Separator />

          {/* Comment */}
          {entry.comment && (
            <div>
              <p className="text-sm font-medium mb-1">코멘트</p>
              <p className="text-sm text-muted-foreground">{entry.comment}</p>
            </div>
          )}

          {/* Additional details */}
          {entry.details && Object.keys(entry.details).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">추가 정보</p>
              <dl className="space-y-2">
                {Object.entries(entry.details).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-2">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {key}
                    </dt>
                    <dd className="text-sm">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact version of timeline for smaller displays
 */
export interface ChangeOrderTimelineCompactProps {
  changeOrderId: string;
  maxEntries?: number;
  className?: string;
}

export function ChangeOrderTimelineCompact({
  changeOrderId,
  maxEntries = 5,
  className,
}: ChangeOrderTimelineCompactProps) {
  const { data: auditTrail, isLoading } = trpc.plm.changeOrder.auditTrail.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  const entries = (auditTrail || []).slice(0, maxEntries) as TimelineEntry[];

  if (isLoading || entries.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {entries.map((entry) => {
        const config =
          eventTypeConfig[entry.eventType as TimelineEventType] ||
          eventTypeConfig.updated;
        const Icon = config.icon;

        return (
          <div
            key={entry.id}
            className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30"
          >
            <Icon className={cn("h-4 w-4", config.color)} />
            <span className="font-medium">{config.label}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground truncate">
              {entry.userName}
            </span>
            <span className="text-muted-foreground ml-auto text-xs">
              {formatDistanceToNow(new Date(entry.timestamp), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
