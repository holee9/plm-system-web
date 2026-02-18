// SSE Notifications Endpoint
// Provides real-time notification updates via Server-Sent Events

import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { EventEmitter } from "events";

// SSE connection management
const notificationClients = new Map<string, EventEmitter>();
const RECONNECT_INTERVAL = 3000; // 3 seconds

// SSE response helper
function sendEvent(eventEmitter: EventEmitter, event: string, data: any) {
  eventEmitter.emit("message", {
    event,
    data: JSON.stringify(data),
  });
}

// GET handler for SSE connections
export async function GET(request: NextRequest) {
  // Verify authentication
  const token = await getToken({ req: request });
  if (!token?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = token.id as string;

  // Create a new EventEmitter for this connection
  const eventEmitter = new EventEmitter();
  notificationClients.set(userId, eventEmitter);

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `: connected\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Listen for incoming messages
      const messageHandler = (message: any) => {
        const sseData = `${message.event ? `event: ${message.event}\n` : ""}data: ${message.data}\n\n`;
        controller.enqueue(new TextEncoder().encode(sseData));
      };

      eventEmitter.on("message", messageHandler);

      // Keep-alive: send a comment every 30s to prevent timeout
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
      }, 30000);

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
        eventEmitter.off("message", messageHandler);
        notificationClients.delete(userId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

// Helper function to send notifications to a specific user
export function sendNotificationToUser(userId: string, notification: any) {
  const eventEmitter = notificationClients.get(userId);
  if (eventEmitter) {
    sendEvent(eventEmitter, "notification", notification);
  }
}

// Helper function to broadcast to all users
export function broadcastNotification(notification: any) {
  for (const [userId, eventEmitter] of notificationClients.entries()) {
    sendEvent(eventEmitter, "notification", notification);
  }
}

// Helper function to send unread count update
export function sendUnreadCountUpdate(userId: string, count: number) {
  const eventEmitter = notificationClients.get(userId);
  if (eventEmitter) {
    sendEvent(eventEmitter, "unread-count", { count });
  }
}
