-- Create notification_type enum
CREATE TYPE "notification_type" AS ENUM ('issue_assigned', 'issue_mentioned', 'issue_commented', 'issue_status_changed', 'project_member_added');

-- Create notifications table
CREATE TABLE "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" "notification_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "link" VARCHAR(500),
    "created_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for notifications
CREATE INDEX "notifications_type_idx" ON "notifications"("type");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");
CREATE INDEX "notifications_created_by_idx" ON "notifications"("created_by");

-- Create notification_recipients table
CREATE TABLE "notification_recipients" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "notification_id" UUID NOT NULL REFERENCES "notifications"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "is_read" BOOLEAN DEFAULT false NOT NULL,
    "read_at" TIMESTAMP
);

-- Create indexes for notification_recipients
CREATE INDEX "notification_recipients_notification_user_idx" ON "notification_recipients"("notification_id", "user_id");
CREATE INDEX "notification_recipients_user_idx" ON "notification_recipients"("user_id");
CREATE INDEX "notification_recipients_is_read_idx" ON "notification_recipients"("is_read");