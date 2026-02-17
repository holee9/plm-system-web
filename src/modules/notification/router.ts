// Notification tRPC Router
import { z } from "zod";
import { router, protectedProcedure } from "~/server/trpc";
import * as service from "./service";
import type { NotificationType } from "./types";

function getUserId(ctx: any): string {
  return ctx.user.id;
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
  list: protectedProcedure
    .input(listNotificationsSchema)
    .query(async ({ ctx, input }) => {
      return service.listNotifications(getUserId(ctx), input);
    }),

  // Get unread count for current user
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      return service.getUnreadCount(getUserId(ctx));
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(markAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      return service.markAsRead(input.id, getUserId(ctx));
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const count = await service.markAllAsRead(getUserId(ctx));
      return { success: true, count };
    }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await service.deleteNotification(input.id, getUserId(ctx));
      return { success: true };
    }),
});
