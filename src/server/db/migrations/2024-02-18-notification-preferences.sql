-- Migration: Add notification_preferences table
-- Created: 2024-02-18
-- Description: Add user notification preferences with channel, category, and frequency settings

-- Create notification_channel enum
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push');

-- Create notification_category enum
CREATE TYPE notification_category AS ENUM ('issues', 'projects', 'plm');

-- Create notification_frequency enum
CREATE TYPE notification_frequency AS ENUM ('immediate', 'hourly', 'daily', 'weekly');

-- Create notification_preferences table
CREATE TABLE notification_preferences (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  category notification_category NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency notification_frequency NOT NULL DEFAULT 'immediate',
  project_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, channel, category, project_id)
);

-- Create indexes for better query performance
CREATE INDEX notification_preferences_user_id_idx ON notification_preferences(user_id);
CREATE INDEX notification_preferences_project_id_idx ON notification_preferences(project_id);

-- Add comment
COMMENT ON TABLE notification_preferences IS 'User notification preferences by channel, category, and optional project override';
COMMENT ON COLUMN notification_preferences.user_id IS 'User ID who owns this preference';
COMMENT ON COLUMN notification_preferences.channel IS 'Notification channel (in_app, email, push)';
COMMENT ON COLUMN notification_preferences.category IS 'Notification category (issues, projects, plm)';
COMMENT ON COLUMN notification_preferences.enabled IS 'Whether notifications are enabled for this channel/category';
COMMENT ON COLUMN notification_preferences.frequency IS 'Notification frequency (immediate, hourly, daily, weekly)';
COMMENT ON COLUMN notification_preferences.project_id IS 'Optional project ID for project-specific overrides';
