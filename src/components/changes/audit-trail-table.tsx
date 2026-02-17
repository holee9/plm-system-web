"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  GitCommit,
  User,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Audit trail entry types
 */
export type AuditEventType =
  | "created"
  | "updated"
  | "submitted"
  | "accepted_for_review"
  | "approved"
  | "rejected"
  | "implemented"
  | "comment_added"
  | "document_attached"
  | "status_changed";

/**
 * Audit trail entry interface
 */
export interface AuditTrailEntry {
  id: string;
  changeOrderId: string;
  eventType: AuditEventType;
  userId: string;
  userName: string;
  userEmail?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
  previousValue?: string;
  newValue?: string;
  comment?: string;
}

/**
 * Audit trail table component props
 */
interface AuditTrailTableProps {
  /** Change order ID to fetch audit trail for */
  changeOrderId: string;
  /** Optional max height for the scrollable area */
  maxHeight?: string;
  /** Optional className */
  className?: string;
}

/**
 * Event type configuration for display
 */
const eventTypeConfig: Record<
  AuditEventType,
  { label: string; icon: typeof GitCommit; color: string; bgColor: string }
> = {
  created: {
    label: "생성됨",
    icon: GitCommit,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  updated: {
    label: "수정됨",
    icon: FileText,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
  },
  submitted: {
    label: "제출됨",
    icon: Eye,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
  },
  accepted_for_review: {
    label: "검토 승인됨",
    icon: Eye,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  approved: {
    label: "승인됨",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
  },
  rejected: {
    label: "거부됨",
    icon: XCircle,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950",
  },
  implemented: {
    label: "구현됨",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  comment_added: {
    label: "댓글 추가됨",
    icon: FileText,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
  },
  document_attached: {
    label: "문서 첨부됨",
    icon: FileText,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950",
  },
  status_changed: {
    label: "상태 변경됨",
    icon: AlertCircle,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
};

/**
 * AuditTrailTable Component
 * @description Displays the audit trail history for a change order
 */
export function AuditTrailTable({
  changeOrderId,
  maxHeight = "400px",
  className,
}: AuditTrailTableProps) {
  // Fetch audit trail
  const { data: auditTrail, isLoading } = trpc.plm.changeOrder.auditTrail.useQuery(
    { changeOrderId },
    {
      enabled: !!changeOrderId,
    }
  );

  const entries = auditTrail || [];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">감사 추적</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">감사 추적</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              감사 추적 기록이 없습니다
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
          감사 추적
          <Badge variant="secondary" className="ml-auto">
            {entries.length}개 항목
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-14"> </TableHead>
                <TableHead>이벤트</TableHead>
                <TableHead>사용자</TableHead>
                <TableHead>시간</TableHead>
                <TableHead className="w-20"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry: any, index: number) => {
                const config = eventTypeConfig[entry.eventType as AuditEventType] || eventTypeConfig.updated;
                const Icon = config.icon;

                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", config.bgColor)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{config.label}</p>
                        {entry.comment && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {entry.comment}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{entry.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.timestamp), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AuditTrailDetail entry={entry} config={config} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Audit trail detail dialog component
 */
interface AuditTrailDetailProps {
  entry: AuditTrailEntry;
  config: {
    label: string;
    icon: typeof GitCommit;
    color: string;
    bgColor: string;
  };
}

function AuditTrailDetail({ entry, config }: AuditTrailDetailProps) {
  const hasDetails =
    entry.details ||
    entry.previousValue ||
    entry.newValue ||
    entry.comment;

  if (!hasDetails) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", config.bgColor)}>
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

          {/* Value changes */}
          {(entry.previousValue || entry.newValue) && (
            <div>
              <p className="text-sm font-medium mb-2">변경 사항</p>
              <div className="grid grid-cols-2 gap-4">
                {entry.previousValue && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      이전 값
                    </p>
                    <p className="text-sm line-clamp-3">{entry.previousValue}</p>
                  </div>
                )}
                {entry.newValue && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      새 값
                    </p>
                    <p className="text-sm line-clamp-3">{entry.newValue}</p>
                  </div>
                )}
              </div>
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
 * Timeline view of audit trail
 * Alternative visualization as a vertical timeline
 */
interface AuditTrailTimelineProps {
  changeOrderId: string;
  maxEntries?: number;
  className?: string;
}

export function AuditTrailTimeline({
  changeOrderId,
  maxEntries,
  className,
}: AuditTrailTimelineProps) {
  // Fetch audit trail
  const { data: auditTrail, isLoading } = trpc.plm.changeOrder.auditTrail.useQuery(
    { changeOrderId },
    {
      enabled: !!changeOrderId,
    }
  );

  const entries = (auditTrail || []).slice(0, maxEntries);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          감사 추적 기록이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {entries.map((entry: any, index: number) => {
        const config = eventTypeConfig[entry.eventType as AuditEventType] || eventTypeConfig.updated;
        const Icon = config.icon;
        const isLast = index === entries.length - 1;

        return (
          <div key={entry.id} className="flex gap-4">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2", config.bgColor, {
                "border-primary": entry.eventType === "approved" || entry.eventType === "implemented",
                "border-muted": !entry.eventType.includes("approved"),
              })}>
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{config.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.userName} •{" "}
                    {formatDistanceToNow(new Date(entry.timestamp), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
              {entry.comment && (
                <p className="text-sm text-muted-foreground mt-2">{entry.comment}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>);
}
