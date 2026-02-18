"use client";

import * as React from "react";
import { Bell, Check, Trash2, Search, Filter, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  notificationId: string;
  isRead: boolean;
  readAt: Date | null;
  notification: {
    id: string;
    type: string;
    title: string;
    message: string | null;
    link: string | null;
    createdAt: Date;
  };
}

// Notification type configuration
const notificationConfig: Record<string, { label: string; color: string; icon: string }> = {
  issue_assigned: { label: "이슈 할당", color: "text-blue-500", icon: "📋" },
  issue_mentioned: { label: "멘션", color: "text-purple-500", icon: "💬" },
  issue_commented: { label: "댓글", color: "text-green-500", icon: "💭" },
  issue_status_changed: { label: "상태 변경", color: "text-amber-500", icon: "🔄" },
  project_member_added: { label: "멤버 추가", color: "text-cyan-500", icon: "👥" },
  change_order_approved: { label: "승인 완료", color: "text-emerald-500", icon: "✅" },
  change_order_rejected: { label: "거부됨", color: "text-rose-500", icon: "❌" },
  change_order_submitted: { label: "제출됨", color: "text-blue-500", icon: "📤" },
};

export function NotificationCenter() {
  const utils = trpc.useUtils();

  // State for filters
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [readFilter, setReadFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Fetch notifications
  const { data: notificationsData, isLoading } = trpc.notification.list.useQuery(
    {
      limit: 50,
      ...(typeFilter !== "all" && { type: typeFilter as any }),
      ...(readFilter === "unread" && { isRead: false }),
      ...(readFilter === "read" && { isRead: true }),
    },
    {
      refetchOnWindowFocus: true,
    }
  );

  const notifications = notificationsData?.items ?? [];
  const unreadCount = notificationsData?.unreadCount ?? 0;

  // Filter by search query
  const filteredNotifications = React.useMemo(() => {
    if (!searchQuery) return notifications;
    const query = searchQuery.toLowerCase();
    return notifications.filter((n) =>
      n.notification.title.toLowerCase().includes(query) ||
      n.notification.message?.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  // Mark as read mutation
  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  // Mark all as read mutation
  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count}개의 알림을 읽음으로 표시했습니다`);
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
    onError: () => {
      toast.error("실패했습니다");
    },
  });

  // Delete mutation
  const deleteNotification = trpc.notification.delete.useMutation({
    onSuccess: () => {
      toast.success("알림이 삭제되었습니다");
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead.mutate({ id: notification.id });
    }

    if (notification.notification.link) {
      window.location.href = notification.notification.link;
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate({ id });
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate({ id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">알림 센터</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림` : "읽지 않은 알림이 없습니다"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            모두 읽음 표시
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="알림 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="유형 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 유형</SelectItem>
                <SelectItem value="issue_assigned">이슈 할당</SelectItem>
                <SelectItem value="issue_mentioned">멘션</SelectItem>
                <SelectItem value="issue_commented">댓글</SelectItem>
                <SelectItem value="issue_status_changed">상태 변경</SelectItem>
                <SelectItem value="project_member_added">멤버 추가</SelectItem>
              </SelectContent>
            </Select>

            {/* Read status filter */}
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="읽음 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="unread">읽지 않음</SelectItem>
                <SelectItem value="read">읽음</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications list */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium mb-2">
              {searchQuery || typeFilter !== "all" || readFilter !== "all"
                ? "필터링된 알림이 없습니다"
                : "알림이 없습니다"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || typeFilter !== "all" || readFilter !== "all"
                ? "다른 필터 조건을 시도해보세요"
                : "새로운 알림이 여기에 표시됩니다"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((item) => {
            const config = notificationConfig[item.notification.type] || {
              label: "알림",
              color: "text-muted-foreground",
              icon: "🔔",
            };

            return (
              <Card
                key={item.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent/50",
                  !item.isRead && "bg-accent/30 border-l-4 border-l-primary"
                )}
                onClick={() => handleNotificationClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0">{config.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.notification.title}</h3>
                          {!item.isRead && (
                            <Badge variant="default" className="text-xs">새 알림</Badge>
                          )}
                        </div>
                        <span className={cn("text-xs", config.color)}>
                          {config.label}
                        </span>
                      </div>
                      {item.notification.message && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {item.notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.notification.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!item.isRead && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item.id); }}>
                            <Check className="h-4 w-4 mr-2" />
                            읽음 표시
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
