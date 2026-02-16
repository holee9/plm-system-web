// Notification module - Notification Template
// Placeholder for notification template implementation

export interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  bodyTemplate: string;
  variables: string[]; // ['userName', 'issueTitle', etc.]
}
