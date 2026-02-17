// Notification module types
export type NotificationType =
  | "issue_assigned"
  | "issue_mentioned"
  | "issue_commented"
  | "issue_status_changed"
  | "project_member_added";

export type NotificationStatus = "unread" | "read";

export interface NotificationData {
  // Additional data specific to notification type
  issueId?: string;
  issueNumber?: string;
  projectKey?: string;
  projectId?: string;
  authorName?: string;
  authorId?: string;
  oldStatus?: string;
  newStatus?: string;
  commentContent?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData | null;
  link: string | null;
  createdBy: string | null; // User ID who triggered the notification
  createdAt: Date;
}

export interface NotificationRecipient {
  id: string;
  notificationId: string;
  userId: string;
  isRead: boolean;
  readAt: Date | null;
  notification: Notification; // Joined notification
}

export interface CreateNotificationInput {
  type: NotificationType;
  recipientIds: string[];
  title: string;
  message: string;
  data?: NotificationData;
  link?: string;
  createdBy?: string;
}

export interface ListNotificationsInput {
  isRead?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}

export interface PaginatedNotifications {
  items: NotificationRecipient[];
  total: number;
  unreadCount: number;
}

// Template variable substitution context
export interface TemplateContext {
  [key: string]: string;
}
