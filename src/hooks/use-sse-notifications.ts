"use client";

import * as React from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SSENotificationEvent {
  type: "connected" | "notification" | "ping";
  data?: any;
  message?: string;
  timestamp: string;
}

export function useSSENotifications() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [lastNotification, setLastNotification] = React.useState<any>(null);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const utils = trpc.useUtils();

  React.useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource("/api/notifications/stream");
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("SSE notification stream connected");
    };

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const data: SSENotificationEvent = JSON.parse(event.data);

        if (data.type === "notification" && data.data) {
          setLastNotification(data.data);

          // Show toast notification
          toast(data.data.title || "새 알림", {
            description: data.data.message,
            action: data.data.link ? {
              label: "보기",
              onClick: () => {
                window.location.href = data.data.link;
              },
            } : undefined,
          });

          // Invalidate notifications query to refresh list
          utils.notification.list.invalidate();
          utils.notification.getUnreadCount.invalidate();
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      setIsConnected(false);

      // Reconnect after delay
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          const newSource = new EventSource("/api/notifications/stream");
          eventSourceRef.current = newSource;
        }
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [utils]);

  return {
    isConnected,
    lastNotification,
  };
}

/**
 * Extended SSE hook with custom event handlers
 */
export function useSSENotificationsWithOptions(options: {
  onNotification?: (notification: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  enableToast?: boolean;
}) {
  const [isConnected, setIsConnected] = React.useState(false);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const utils = trpc.useUtils();

  const {
    onNotification,
    onConnect,
    onDisconnect,
    enableToast = true,
  } = options;

  React.useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      onConnect?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSENotificationEvent = JSON.parse(event.data);

        if (data.type === "notification" && data.data) {
          onNotification?.(data.data);

          if (enableToast) {
            toast(data.data.title || "새 알림", {
              description: data.data.message,
              action: data.data.link ? {
                label: "보기",
                onClick: () => {
                  window.location.href = data.data.link;
                },
              } : undefined,
            });
          }

          // Invalidate queries
          utils.notification.list.invalidate();
          utils.notification.getUnreadCount.invalidate();
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      onDisconnect?.();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [utils, onNotification, onConnect, onDisconnect, enableToast]);

  return {
    isConnected,
    close: () => {
      eventSourceRef.current?.close();
      setIsConnected(false);
    },
  };
}
