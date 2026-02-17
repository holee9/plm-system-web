// Notification service - Business logic for notifications
import { eq, and, desc, count, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { notifications, notificationRecipients } from "./schemas";
import {
  renderNotification,
  substituteTemplateVariables,
} from "./templates";
import type {
  Notification,
  NotificationRecipient,
  CreateNotificationInput,
  ListNotificationsInput,
  PaginatedNotifications,
  NotificationType,
  TemplateContext,
  NotificationData,
} from "./types";

// Custom errors
export class NotificationNotFoundError extends Error {
  constructor(notificationId: string) {
    super(`Notification with ID ${notificationId} not found`);
    this.name = "NotificationNotFoundError";
  }
}

export class NotificationAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationAccessError";
  }
}

/**
 * Create notification and send to recipients
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  // Create notification record
  const [created] = await db
    .insert(notifications)
    .values({
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data || null,
      link: input.link || null,
      createdBy: input.createdBy || null,
    })
    .returning();

  // Create recipient records
  if (input.recipientIds.length > 0) {
    const recipientValues = input.recipientIds.map((userId) => ({
      notificationId: created.id,
      userId,
      isRead: false,
    }));

    await db.insert(notificationRecipients).values(recipientValues);
  }

  // Transform DB type to domain type
  return {
    id: created.id,
    type: created.type as NotificationType,
    title: created.title,
    message: created.message,
    data: created.data as NotificationData | null,
    link: created.link,
    createdBy: created.createdBy,
    createdAt: created.createdAt,
  };
}

/**
 * Create notification with template rendering
 */
export async function createNotificationFromTemplate(
  type: NotificationType,
  recipientIds: string[],
  context: TemplateContext,
  language: "ko" | "en" = "ko",
  link?: string,
  createdBy?: string
): Promise<Notification> {
  const { title, message } = renderNotification(type, language, context);

  return createNotification({
    type,
    recipientIds,
    title,
    message,
    data: context,
    link,
    createdBy,
  });
}

/**
 * Get notifications for user with filters and pagination
 */
export async function listNotifications(
  userId: string,
  filters: ListNotificationsInput = {}
): Promise<PaginatedNotifications> {
  const limit = Math.min(filters.limit || 20, 50);
  const offset = filters.offset || 0;

  // Build conditions
  const conditions = [eq(notificationRecipients.userId, userId)];

  if (filters.isRead !== undefined) {
    conditions.push(eq(notificationRecipients.isRead, filters.isRead));
  }

  if (filters.type) {
    conditions.push(eq(notifications.type, filters.type));
  }

  const whereClause = and(...conditions);

  // Get total count
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(notificationRecipients)
    .leftJoin(notifications, eq(notificationRecipients.notificationId, notifications.id))
    .where(whereClause);

  // Get unread count
  const [{ unreadCountValue }] = await db
    .select({ unreadCountValue: count() })
    .from(notificationRecipients)
    .where(
      and(
        eq(notificationRecipients.userId, userId),
        eq(notificationRecipients.isRead, false)
      )
    );

  // Get notifications with pagination
  const items = await db
    .select({
      id: notificationRecipients.id,
      notificationId: notificationRecipients.notificationId,
      userId: notificationRecipients.userId,
      isRead: notificationRecipients.isRead,
      readAt: notificationRecipients.readAt,
      // Notification fields
      notification: {
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        data: notifications.data,
        link: notifications.link,
        createdBy: notifications.createdBy,
        createdAt: notifications.createdAt,
      },
    })
    .from(notificationRecipients)
    .leftJoin(notifications, eq(notificationRecipients.notificationId, notifications.id))
    .where(whereClause)
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to match expected type - filter out items with null notifications
  const transformedItems: NotificationRecipient[] = items
    .filter((item) => item.notification !== null)
    .map((item) => ({
      id: item.id,
      notificationId: item.notificationId,
      userId: item.userId,
      isRead: item.isRead,
      readAt: item.readAt,
      notification: {
        id: item.notification!.id,
        type: item.notification!.type as NotificationType,
        title: item.notification!.title,
        message: item.notification!.message,
        data: item.notification!.data as NotificationData | null,
        link: item.notification!.link,
        createdBy: item.notification!.createdBy,
        createdAt: item.notification!.createdAt,
      },
    }));

  return {
    items: transformedItems,
    total: Number(totalCount),
    unreadCount: Number(unreadCountValue),
  };
}

/**
 * Get unread notification count for user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notificationRecipients)
    .where(
      and(
        eq(notificationRecipients.userId, userId),
        eq(notificationRecipients.isRead, false)
      )
    );

  return Number(result.count);
}

/**
 * Mark notification as read
 */
export async function markAsRead(
  recipientId: string,
  userId: string
): Promise<NotificationRecipient> {
  // Verify ownership
  const [existing] = await db
    .select()
    .from(notificationRecipients)
    .where(
      and(
        eq(notificationRecipients.id, recipientId),
        eq(notificationRecipients.userId, userId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new NotificationAccessError("Notification not found or access denied");
  }

  // Update if not already read
  if (!existing.isRead) {
    const [updated] = await db
      .update(notificationRecipients)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notificationRecipients.id, recipientId))
      .returning();

    // Get notification details
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, updated.notificationId))
      .limit(1);

    return {
      ...updated,
      notification: notification ? {
        id: notification.id,
        type: notification.type as NotificationType,
        title: notification.title,
        message: notification.message,
        data: notification.data as NotificationData | null,
        link: notification.link,
        createdBy: notification.createdBy,
        createdAt: notification.createdAt,
      } : null,
    } as NotificationRecipient;
  }

  // Get notification details for existing
  const [notification] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, existing.notificationId))
    .limit(1);

  return {
    ...existing,
    notification: notification ? {
      id: notification.id,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      data: notification.data as NotificationData | null,
      link: notification.link,
      createdBy: notification.createdBy,
      createdAt: notification.createdAt,
    } : null,
  } as NotificationRecipient;
}

/**
 * Mark all notifications as read for user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  // Count records to be updated
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(notificationRecipients)
    .where(
      and(
        eq(notificationRecipients.userId, userId),
        eq(notificationRecipients.isRead, false)
      )
    );

  // Update records
  await db
    .update(notificationRecipients)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(
      and(
        eq(notificationRecipients.userId, userId),
        eq(notificationRecipients.isRead, false)
      )
    );

  return Number(totalCount);
}

/**
 * Delete notification recipient record (soft delete for user)
 */
export async function deleteNotification(
  recipientId: string,
  userId: string
): Promise<void> {
  // Verify ownership
  const [existing] = await db
    .select()
    .from(notificationRecipients)
    .where(
      and(
        eq(notificationRecipients.id, recipientId),
        eq(notificationRecipients.userId, userId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new NotificationAccessError("Notification not found or access denied");
  }

  // Delete recipient record
  await db
    .delete(notificationRecipients)
    .where(eq(notificationRecipients.id, recipientId));
}

/**
 * Clean up old notifications (for maintenance)
 * Deletes notification recipients where notification was read long ago
 */
export async function cleanupOldNotifications(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Count records to be deleted
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(notificationRecipients)
    .where(
      and(
        sql`${notificationRecipients.readAt} < ${cutoffDate}`,
        eq(notificationRecipients.isRead, true)
      )
    );

  // Delete old read notifications
  await db
    .delete(notificationRecipients)
    .where(
      and(
        sql`${notificationRecipients.readAt} < ${cutoffDate}`,
        eq(notificationRecipients.isRead, true)
      )
    );

  return Number(totalCount);
}
