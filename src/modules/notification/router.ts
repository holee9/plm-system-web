// Notification tRPC Router
import { z } from "zod";
import { router, publicProcedure } from "~/server/trpc";
import * as service from "./service";
import type { NotificationType } from "./types";

// TODO: Replace with actual auth context once implemented
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

function getUserId(ctx: any): string {
  // For now, use a test user ID
  // TODO: Get from auth context once implemented
  return TEST_USER_ID;
}

// Input schemas
const listNotificationsSchema = z.object({
  isRead: z.boolean().optional(),
  type: z.enum([
    "issue_assigned",
    "issue_mentioned",
    "issue_commented",
    "issue_status_changed",
    "project_member_added",
  ]).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  offset: z.number().int().min(0).optional(),
});

const markAsReadSchema = z.object({
  id: z.string().uuid(),
});

// Export router
export const notificationRouter = router({
  // List notifications for current user
  list: publicProcedure
    .input(listNotificationsSchema)
    .query(async ({ ctx, input }) => {
      return service.listNotifications(getUserId(ctx), input);
    }),

  // Get unread count for current user
  getUnreadCount: publicProcedure
    .query(async ({ ctx }) => {
      return service.getUnreadCount(getUserId(ctx));
    }),

  // Mark notification as read
  markAsRead: publicProcedure
    .input(markAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      return service.markAsRead(input.id, getUserId(ctx));
    }),

  // Mark all notifications as read
  markAllAsRead: publicProcedure
    .mutation(async ({ ctx }) => {
      const count = await service.markAllAsRead(getUserId(ctx));
      return { success: true, count };
    }),

  // Delete notification
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await service.deleteNotification(input.id, getUserId(ctx));
      return { success: true };
    }),
});
