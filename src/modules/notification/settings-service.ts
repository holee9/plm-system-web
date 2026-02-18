// Notification settings service - Business logic for user notification preferences
import { eq, and, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { notificationPreferences } from "./schemas";
import type {
  NotificationChannel,
  NotificationCategory,
  NotificationFrequency,
  NotificationPreference,
  UpdateNotificationPreferenceInput,
  GetUserPreferencesInput,
  BulkUpdatePreferencesInput,
} from "./types";

// Custom errors
export class NotificationPreferenceNotFoundError extends Error {
  constructor(userId: string, channel: NotificationChannel, category: NotificationCategory) {
    super(`Notification preference not found for user ${userId}, channel ${channel}, category ${category}`);
    this.name = "NotificationPreferenceNotFoundError";
  }
}

/**
 * Get default notification preferences for a user
 * Creates default preferences if they don't exist
 */
async function getOrCreateDefaultPreferences(
  userId: string,
  channel: NotificationChannel,
  category: NotificationCategory,
  projectId?: string
): Promise<NotificationPreference> {
  // Try to find existing preference
  const conditions = [
    eq(notificationPreferences.userId, userId),
    eq(notificationPreferences.channel, channel),
    eq(notificationPreferences.category, category),
  ];

  if (projectId) {
    conditions.push(eq(notificationPreferences.projectId, projectId));
  } else {
    // For global preferences, projectId should be null
    conditions.push(eq(notificationPreferences.projectId, null as any));
  }

  const [existing] = await db
    .select()
    .from(notificationPreferences)
    .where(and(...conditions))
    .limit(1);

  if (existing) {
    return {
      userId: existing.userId,
      channel: existing.channel as NotificationChannel,
      category: existing.category as NotificationCategory,
      enabled: existing.enabled,
      frequency: existing.frequency as NotificationFrequency,
      projectId: existing.projectId,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    };
  }

  // Create default preference
  const [created] = await db
    .insert(notificationPreferences)
    .values({
      userId,
      channel,
      category,
      enabled: true,
      frequency: "immediate",
      projectId: projectId || null,
    })
    .returning();

  return {
    userId: created.userId,
    channel: created.channel as NotificationChannel,
    category: created.category as NotificationCategory,
    enabled: created.enabled,
    frequency: created.frequency as NotificationFrequency,
    projectId: created.projectId,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
}

/**
 * Get all notification preferences for a user
 */
export async function getUserPreferences(
  userId: string,
  filters: GetUserPreferencesInput = {}
): Promise<{
  global: NotificationPreference[];
  projectSpecific: NotificationPreference[];
}> {
  const conditions = [eq(notificationPreferences.userId, userId)];

  if (filters.projectId) {
    conditions.push(eq(notificationPreferences.projectId, filters.projectId));
  }

  const preferences = await db
    .select()
    .from(notificationPreferences)
    .where(and(...conditions))
    .orderBy(notificationPreferences.channel, notificationPreferences.category);

  // Separate global and project-specific preferences
  const global: NotificationPreference[] = [];
  const projectSpecific: NotificationPreference[] = [];

  for (const pref of preferences) {
    const transformed: NotificationPreference = {
      userId: pref.userId,
      channel: pref.channel as NotificationChannel,
      category: pref.category as NotificationCategory,
      enabled: pref.enabled,
      frequency: pref.frequency as NotificationFrequency,
      projectId: pref.projectId,
      createdAt: pref.createdAt,
      updatedAt: pref.updatedAt,
    };

    if (pref.projectId) {
      projectSpecific.push(transformed);
    } else {
      global.push(transformed);
    }
  }

  return { global, projectSpecific };
}

/**
 * Get a single notification preference
 */
export async function getPreference(
  userId: string,
  channel: NotificationChannel,
  category: NotificationCategory,
  projectId?: string
): Promise<NotificationPreference> {
  return getOrCreateDefaultPreferences(userId, channel, category, projectId);
}

/**
 * Update a notification preference
 */
export async function updatePreference(
  userId: string,
  input: UpdateNotificationPreferenceInput
): Promise<NotificationPreference> {
  const { channel, category, enabled, frequency, projectId } = input;

  // Build conditions
  const conditions = [
    eq(notificationPreferences.userId, userId),
    eq(notificationPreferences.channel, channel),
    eq(notificationPreferences.category, category),
  ];

  if (projectId) {
    conditions.push(eq(notificationPreferences.projectId, projectId));
  } else {
    conditions.push(eq(notificationPreferences.projectId, null as any));
  }

  // Check if preference exists
  const [existing] = await db
    .select()
    .from(notificationPreferences)
    .where(and(...conditions))
    .limit(1);

  if (existing) {
    // Update existing preference
    const [updated] = await db
      .update(notificationPreferences)
      .set({
        enabled: enabled !== undefined ? enabled : existing.enabled,
        frequency: frequency !== undefined ? frequency : existing.frequency,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning();

    return {
      userId: updated.userId,
      channel: updated.channel as NotificationChannel,
      category: updated.category as NotificationCategory,
      enabled: updated.enabled,
      frequency: updated.frequency as NotificationFrequency,
      projectId: updated.projectId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  // Create new preference
  const [created] = await db
    .insert(notificationPreferences)
    .values({
      userId,
      channel,
      category,
      enabled: enabled ?? true,
      frequency: frequency ?? "immediate",
      projectId: projectId || null,
    })
    .returning();

  return {
    userId: created.userId,
    channel: created.channel as NotificationChannel,
    category: created.category as NotificationCategory,
    enabled: created.enabled,
    frequency: created.frequency as NotificationFrequency,
    projectId: created.projectId,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
}

/**
 * Bulk update notification preferences
 */
export async function bulkUpdatePreferences(
  userId: string,
  input: BulkUpdatePreferencesInput
): Promise<NotificationPreference[]> {
  const { preferences } = input;
  const results: NotificationPreference[] = [];

  for (const pref of preferences) {
    const updated = await updatePreference(userId, pref);
    results.push(updated);
  }

  return results;
}

/**
 * Reset preferences to defaults for a user
 */
export async function resetPreferencesToDefaults(
  userId: string,
  projectId?: string
): Promise<NotificationPreference[]> {
  const conditions = [eq(notificationPreferences.userId, userId)];

  if (projectId) {
    conditions.push(eq(notificationPreferences.projectId, projectId));
  } else {
    conditions.push(eq(notificationPreferences.projectId, null as any));
  }

  // Delete existing preferences
  await db
    .delete(notificationPreferences)
    .where(and(...conditions));

  // Create default preferences for all combinations
  const channels: NotificationChannel[] = ["in_app", "email", "push"];
  const categories: NotificationCategory[] = ["issues", "projects", "plm"];
  const defaults: NotificationPreference[] = [];

  for (const channel of channels) {
    for (const category of categories) {
      const created = await getOrCreateDefaultPreferences(userId, channel, category, projectId);
      defaults.push(created);
    }
  }

  return defaults;
}

/**
 * Check if a notification should be sent based on user preferences
 */
export async function shouldSendNotification(
  userId: string,
  channel: NotificationChannel,
  category: NotificationCategory,
  projectId?: string
): Promise<boolean> {
  // First check project-specific preference
  if (projectId) {
    try {
      const projectPref = await getPreference(userId, channel, category, projectId);
      if (projectPref.enabled !== undefined) {
        return projectPref.enabled;
      }
    } catch {
      // Fall back to global preference
    }
  }

  // Check global preference
  try {
    const globalPref = await getPreference(userId, channel, category);
    return globalPref.enabled;
  } catch {
    // Default to enabled if no preference found
    return true;
  }
}
