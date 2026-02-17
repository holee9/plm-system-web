"use client";

import * as React from "react";
import { Bell, X, Check } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  resourceType: string | null;
  resourceId: string | null;
  isRead: boolean;
  createdAt: Date;
}

// Notification type icons mapping
const notificationIcons: Record<string, React.ElementType> = {
  issue_assigned: Bell,
  issue_mentioned: Bell,
  issue_commented: Bell,
  issue_status_changed: Bell,
  project_member_added: Bell,
};

// Notification type colors
const notificationColors: Record<string, string> = {
  issue_assigned: "text-blue-500",
  issue_mentioned: "text-purple-500",
  issue_commented: "text-green-500",
  issue_status_changed: "text-amber-500",
  project_member_added: "text-cyan-500",
};

function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

function NotificationItem({ notification, onClick }: { notification: Notification; onClick: () => void }) {
  const Icon = notificationIcons[notification.type] || Bell;
  const color = notificationColors[notification.type] || "text-muted-foreground";

  return (
    <DropdownMenuItem
      className={cn(
        "flex flex-col items-start gap-1 p-3 cursor-pointer",
        !notification.isRead && "bg-accent/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2 w-full">
        <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", color)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{notification.title}</p>
          {notification.message && (
            <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
          )}
        </div>
        {!notification.isRead && (
          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
        )}
      </div>
      <p className="text-xs text-muted-foreground pl-6">
        {formatNotificationTime(notification.createdAt)}
      </p>
    </DropdownMenuItem>
  );
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);

  // Fetch unread count
  const { data: unreadCount = 0 } = trpc.notification.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Fetch notifications
  const { data: notificationsData, isLoading } = trpc.notification.list.useQuery(
    { limit: 10 },
    {
      enabled: isOpen,
    }
  );

  const notifications = Array.isArray(notificationsData) ? notificationsData : notificationsData?.items ?? [];

  const utils = trpc.useUtils();

  // Mark as read mutation
  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getUnreadCount.invalidate();
      utils.notification.list.invalidate();
    },
  });

  // Mark all as read mutation
  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success("All notifications marked as read");
      utils.notification.getUnreadCount.invalidate();
      utils.notification.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });

  // Delete notification mutation
  const deleteNotification = trpc.notification.delete.useMutation({
    onSuccess: () => {
      utils.notification.getUnreadCount.invalidate();
      utils.notification.list.invalidate();
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead.mutate({ id: notification.id });
    }

    // Navigate to resource if available
    if (notification.resourceType && notification.resourceId) {
      const path = getNotificationPath(notification.resourceType, notification.resourceId);
      if (path) {
        window.location.href = path;
      }
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate({ id });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="p-1">
                {notifications.map((notification: any) => (
                  <div key={notification.id} className="relative group">
                    <NotificationItem
                      notification={{
                        ...notification,
                        createdAt: new Date(notification.createdAt),
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DropdownMenuGroup>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                asChild
              >
                <a href="/notifications">View all notifications</a>
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to get path from notification resource
function getNotificationPath(resourceType: string, resourceId: string): string | null {
  const pathMap: Record<string, string> = {
    issue: `/issues/${resourceId}`,
    change_order: `/changes/${resourceId}`,
    part: `/parts/${resourceId}`,
    project: `/projects/${resourceId}`,
    milestone: `/milestones/${resourceId}`,
  };

  return pathMap[resourceType] || null;
}
