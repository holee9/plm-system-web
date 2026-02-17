// Notification module barrel export
export * from "./types";
export * from "./templates";
export * from "./schemas";
export * from "./service";
export { notificationRouter } from "./router";

// Legacy exports (deprecated)
export type { NotificationType as LegacyNotificationType } from "./notification";
export type { NotificationTemplate } from "./notification-template";
export type { NotificationPreference } from "./notification-preference";
