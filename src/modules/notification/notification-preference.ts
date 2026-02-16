// Notification module - Notification Preference
// Placeholder for notification preference implementation

export interface NotificationPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  categories: string[]; // ['issues', 'projects', 'plm', etc.]
}
