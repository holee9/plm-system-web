/**
 * SSE Notification Stream
 * Server-Sent Events endpoint for real-time notifications
 */
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "~/server/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SSE stream for real-time notifications
 *
 * Clients can connect to this endpoint to receive real-time notifications.
 * The connection stays open and the server pushes new notifications as they arrive.
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let userId: string;
  try {
    const payload = await verifyJWT(token);
    userId = payload.sub;
  } catch {
    return new Response("Invalid token", { status: 401 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      const data = JSON.stringify({
        type: "connected",
        message: "Connected to notification stream",
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      // Keep-alive ping every 30 seconds
      const pingInterval = setInterval(() => {
        const ping = JSON.stringify({ type: "ping", timestamp: new Date().toISOString() });
        controller.enqueue(encoder.encode(`data: ${ping}\n\n`));
      }, 30000);

      // TODO: In a real implementation, you would:
      // 1. Subscribe to a pub/sub system (Redis, PostgreSQL NOTIFY, etc.)
      // 2. Listen for new notifications for this user
      // 3. Push them to the client as they arrive

      // Mock notification for demo (remove in production)
      setTimeout(() => {
        const notification = JSON.stringify({
          type: "notification",
          data: {
            id: "demo-" + Date.now(),
            title: "새로운 알림",
            message: "실시간 알림이 작동 중입니다!",
            link: "/notifications",
          },
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`data: ${notification}\n\n`));
      }, 5000);

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering
    },
  });
}
