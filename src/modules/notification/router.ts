// Notification tRPC Router
import { z } from "zod";
import { router, protectedProcedure } from "~/server/trpc";
import * as service from "./service";
import * as settingsService from "./settings-service";
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

  // Update notification (mark as read and return notification data for navigation)
  updateNotification: protectedProcedure
    .input(z.object({
      recipientId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = getUserId(ctx);
      const result = await service.markAsRead(input.recipientId, userId);

      // Return notification data with link for client-side navigation
      return {
        success: true,
        notification: result.notification,
        isRead: result.isRead,
      };
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

  // ========== Notification Settings ==========

  // Get all notification preferences for current user
  getPreferences: protectedProcedure
    .input(z.object({
      projectId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return settingsService.getUserPreferences(getUserId(ctx), input);
    }),

  // Get a single notification preference
  getPreference: protectedProcedure
    .input(z.object({
      channel: z.enum(["in_app", "email", "push"]),
      category: z.enum(["issues", "projects", "plm"]),
      projectId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return settingsService.getPreference(
        getUserId(ctx),
        input.channel,
        input.category,
        input.projectId
      );
    }),

  // Update a single notification preference
  updatePreference: protectedProcedure
    .input(z.object({
      channel: z.enum(["in_app", "email", "push"]),
      category: z.enum(["issues", "projects", "plm"]),
      enabled: z.boolean().optional(),
      frequency: z.enum(["immediate", "hourly", "daily", "weekly"]).optional(),
      projectId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return settingsService.updatePreference(getUserId(ctx), input);
    }),

  // Bulk update notification preferences
  bulkUpdatePreferences: protectedProcedure
    .input(z.object({
      preferences: z.array(z.object({
        channel: z.enum(["in_app", "email", "push"]),
        category: z.enum(["issues", "projects", "plm"]),
        enabled: z.boolean().optional(),
        frequency: z.enum(["immediate", "hourly", "daily", "weekly"]).optional(),
        projectId: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      return settingsService.bulkUpdatePreferences(getUserId(ctx), input);
    }),

  // Reset preferences to defaults
  resetPreferences: protectedProcedure
    .input(z.object({
      projectId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return settingsService.resetPreferencesToDefaults(getUserId(ctx), input.projectId);
    }),
});
