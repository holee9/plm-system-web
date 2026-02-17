// Notification templates with multi-language support
import type { NotificationType, TemplateContext } from "./types";

export interface NotificationTemplate {
  title: string;
  message: string;
}

export interface NotificationTemplates {
  ko: NotificationTemplate;
  en: NotificationTemplate;
}

// Template definitions for each notification type
export const notificationTemplates: Record<NotificationType, NotificationTemplates> = {
  issue_assigned: {
    ko: {
      title: "이슈 할당",
      message: "{author}님이 {issueNumber} 이슈를 할당했습니다.",
    },
    en: {
      title: "Issue Assigned",
      message: "{author} assigned you to {issueNumber}.",
    },
  },

  issue_mentioned: {
    ko: {
      title: "이슈에서 멘션됨",
      message: "{author}님이 {issueNumber} 이슈에서 멘션했습니다.",
    },
    en: {
      title: "Mentioned in Issue",
      message: "{author} mentioned you in {issueNumber}.",
    },
  },

  issue_commented: {
    ko: {
      title: "새 댓글",
      message: "{author}님이 {issueNumber} 이슈에 댓글을 남겼습니다.",
    },
    en: {
      title: "New Comment",
      message: "{author} commented on {issueNumber}.",
    },
  },

  issue_status_changed: {
    ko: {
      title: "이슈 상태 변경",
      message: "{issueNumber} 이슈 상태가 {oldStatus}에서 {newStatus}(으)로 변경되었습니다.",
    },
    en: {
      title: "Issue Status Changed",
      message: "{issueNumber} status changed from {oldStatus} to {newStatus}.",
    },
  },

  project_member_added: {
    ko: {
      title: "프로젝트 멤버 추가",
      message: "{author}님이 프로젝트에 멤버로 추가했습니다.",
    },
    en: {
      title: "Added to Project",
      message: "{author} added you to the project.",
    },
  },
};

/**
 * Get notification template for type and language
 */
export function getNotificationTemplate(
  type: NotificationType,
  language: "ko" | "en" = "ko"
): NotificationTemplate {
  return notificationTemplates[type][language];
}

/**
 * Substitute variables in template string
 * Replaces {variableName} with actual values from context
 */
export function substituteTemplateVariables(
  template: string,
  context: TemplateContext
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return context[key] || match;
  });
}

/**
 * Render notification with language and context
 */
export function renderNotification(
  type: NotificationType,
  language: "ko" | "en" = "ko",
  context: TemplateContext = {}
): { title: string; message: string } {
  const template = getNotificationTemplate(type, language);

  return {
    title: substituteTemplateVariables(template.title, context),
    message: substituteTemplateVariables(template.message, context),
  };
}

/**
 * Status text mapping for display
 */
export const statusTextMap: Record<string, { ko: string; en: string }> = {
  open: { ko: "열림", en: "Open" },
  in_progress: { ko: "진행 중", en: "In Progress" },
  review: { ko: "검토 중", en: "Review" },
  done: { ko: "완료", en: "Done" },
  closed: { ko: "닫힘", en: "Closed" },
};

/**
 * Get localized status text
 */
export function getStatusText(
  status: string,
  language: "ko" | "en" = "ko"
): string {
  return statusTextMap[status]?.[language] || status;
}
