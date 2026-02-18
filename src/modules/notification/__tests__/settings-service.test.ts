/**
 * Tests for notification settings service
 *
 * These tests follow TDD principles with specification-based testing
 * focusing on domain behavior rather than implementation details.
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { notificationPreferences } from "../schemas";
import * as settingsService from "../settings-service";
import type {
  NotificationChannel,
  NotificationCategory,
  NotificationFrequency,
} from "../types";

describe("Notification Settings Service", () => {
  const testUserId = "test-user-id";
  const testProjectId = "test-project-id";

  // Clean up test data before each test
  beforeEach(async () => {
    await db
      .delete(notificationPreferences)
      .where(eq(notificationPreferences.userId, testUserId));
  });

  // Clean up after all tests
  afterEach(async () => {
    await db
      .delete(notificationPreferences)
      .where(eq(notificationPreferences.userId, testUserId));
  });

  describe("getOrCreateDefaultPreferences", () => {
    it("should create default preferences when none exist", async () => {
      const result = await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "in_app" as NotificationChannel,
        "issues" as NotificationCategory
      );

      expect(result).toEqual({
        userId: testUserId,
        channel: "in_app",
        category: "issues",
        enabled: true,
        frequency: "immediate",
        projectId: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should return existing preferences when they exist", async () => {
      // Create initial preference
      const created = await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "email" as NotificationChannel,
        "projects" as NotificationCategory
      );

      // Get the same preference again
      const retrieved = await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "email" as NotificationChannel,
        "projects" as NotificationCategory
      );

      expect(retrieved.userId).toBe(created.userId);
      expect(retrieved.channel).toBe(created.channel);
      expect(retrieved.category).toBe(created.category);
      expect(retrieved.enabled).toBe(created.enabled);
      expect(retrieved.frequency).toBe(created.frequency);
    });

    it("should create project-specific preferences when projectId is provided", async () => {
      const result = await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "push" as NotificationChannel,
        "plm" as NotificationCategory,
        testProjectId
      );

      expect(result.projectId).toBe(testProjectId);
      expect(result.userId).toBe(testUserId);
      expect(result.channel).toBe("push");
      expect(result.category).toBe("plm");
    });
  });

  describe("getUserPreferences", () => {
    it("should return empty arrays when no preferences exist", async () => {
      const result = await settingsService.getUserPreferences(testUserId);

      expect(result.global).toEqual([]);
      expect(result.projectSpecific).toEqual([]);
    });

    it("should return global preferences when they exist", async () => {
      await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "in_app" as NotificationChannel,
        "issues" as NotificationCategory
      );

      const result = await settingsService.getUserPreferences(testUserId);

      expect(result.global).toHaveLength(1);
      expect(result.global[0]).toMatchObject({
        userId: testUserId,
        channel: "in_app",
        category: "issues",
        enabled: true,
        frequency: "immediate",
        projectId: null,
      });
    });

    it("should return project-specific preferences when they exist", async () => {
      await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "email" as NotificationChannel,
        "projects" as NotificationCategory,
        testProjectId
      );

      const result = await settingsService.getUserPreferences(testUserId, {
        projectId: testProjectId,
      });

      expect(result.projectSpecific).toHaveLength(1);
      expect(result.projectSpecific[0]).toMatchObject({
        userId: testUserId,
        channel: "email",
        category: "projects",
        projectId: testProjectId,
      });
    });
  });

  describe("updatePreference", () => {
    it("should create new preference if it does not exist", async () => {
      const result = await settingsService.updatePreference(testUserId, {
        channel: "in_app" as NotificationChannel,
        category: "issues" as NotificationCategory,
        enabled: false,
        frequency: "daily" as NotificationFrequency,
      });

      expect(result).toMatchObject({
        userId: testUserId,
        channel: "in_app",
        category: "issues",
        enabled: false,
        frequency: "daily",
        projectId: null,
      });
    });

    it("should update existing preference", async () => {
      // Create initial preference
      await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "email" as NotificationChannel,
        "projects" as NotificationCategory
      );

      // Update it
      const updated = await settingsService.updatePreference(testUserId, {
        channel: "email" as NotificationChannel,
        category: "projects" as NotificationCategory,
        enabled: false,
      });

      expect(updated.enabled).toBe(false);
    });

    it("should update only enabled field when specified", async () => {
      await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "push" as NotificationChannel,
        "plm" as NotificationCategory
      );

      const updated = await settingsService.updatePreference(testUserId, {
        channel: "push" as NotificationChannel,
        category: "plm" as NotificationCategory,
        enabled: false,
      });

      expect(updated.enabled).toBe(false);
      expect(updated.frequency).toBe("immediate"); // Should remain unchanged
    });

    it("should update only frequency field when specified", async () => {
      await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "in_app" as NotificationChannel,
        "issues" as NotificationCategory
      );

      const updated = await settingsService.updatePreference(testUserId, {
        channel: "in_app" as NotificationChannel,
        category: "issues" as NotificationCategory,
        frequency: "weekly" as NotificationFrequency,
      });

      expect(updated.frequency).toBe("weekly");
      expect(updated.enabled).toBe(true); // Should remain unchanged
    });

    it("should update project-specific preference", async () => {
      await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "email" as NotificationChannel,
        "projects" as NotificationCategory,
        testProjectId
      );

      const updated = await settingsService.updatePreference(testUserId, {
        channel: "email" as NotificationChannel,
        category: "projects" as NotificationCategory,
        enabled: false,
        projectId: testProjectId,
      });

      expect(updated.projectId).toBe(testProjectId);
      expect(updated.enabled).toBe(false);
    });
  });

  describe("bulkUpdatePreferences", () => {
    it("should update multiple preferences", async () => {
      // Create initial preferences
      await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "in_app" as NotificationChannel,
        "issues" as NotificationCategory
      );
      await settingsService.getOrCreateDefaultPreferences(
        testUserId,
        "email" as NotificationChannel,
        "projects" as NotificationCategory
      );

      // Bulk update
      const results = await settingsService.bulkUpdatePreferences(testUserId, {
        preferences: [
          {
            channel: "in_app" as NotificationChannel,
            category: "issues" as NotificationCategory,
            enabled: false,
          },
          {
            channel: "email" as NotificationChannel,
            category: "projects" as NotificationCategory,
            frequency: "daily" as NotificationFrequency,
          },
        ],
      });

      expect(results).toHaveLength(2);
      expect(results[0].enabled).toBe(false);
      expect(results[1].frequency).toBe("daily");
    });
  });

  describe("resetPreferencesToDefaults", () => {
    it("should reset all preferences to defaults", async () => {
      // Create and modify some preferences
      await settingsService.updatePreference(testUserId, {
        channel: "in_app" as NotificationChannel,
        category: "issues" as NotificationCategory,
        enabled: false,
        frequency: "daily" as NotificationFrequency,
      });

      // Reset to defaults
      const results = await settingsService.resetPreferencesToDefaults(testUserId);

      // Should create default preferences for all channel/category combinations
      expect(results.length).toBeGreaterThan(0);

      // Check that all are enabled with immediate frequency
      results.forEach((pref) => {
        expect(pref.enabled).toBe(true);
        expect(pref.frequency).toBe("immediate");
      });
    });

    it("should reset project-specific preferences when projectId is provided", async () => {
      // Create project-specific preference
      await settingsService.updatePreference(testUserId, {
        channel: "email" as NotificationChannel,
        category: "projects" as NotificationCategory,
        enabled: false,
        projectId: testProjectId,
      });

      // Reset project-specific preferences
      const results = await settingsService.resetPreferencesToDefaults(
        testUserId,
        testProjectId
      );

      // All results should have the projectId
      results.forEach((pref) => {
        expect(pref.projectId).toBe(testProjectId);
        expect(pref.enabled).toBe(true);
      });
    });
  });

  describe("shouldSendNotification", () => {
    it("should return true when preference is enabled", async () => {
      await settingsService.updatePreference(testUserId, {
        channel: "in_app" as NotificationChannel,
        category: "issues" as NotificationCategory,
        enabled: true,
      });

      const shouldSend = await settingsService.shouldSendNotification(
        testUserId,
        "in_app" as NotificationChannel,
        "issues" as NotificationCategory
      );

      expect(shouldSend).toBe(true);
    });

    it("should return false when preference is disabled", async () => {
      await settingsService.updatePreference(testUserId, {
        channel: "email" as NotificationChannel,
        category: "projects" as NotificationCategory,
        enabled: false,
      });

      const shouldSend = await settingsService.shouldSendNotification(
        testUserId,
        "email" as NotificationChannel,
        "projects" as NotificationCategory
      );

      expect(shouldSend).toBe(false);
    });

    it("should return true by default when no preference exists", async () => {
      const shouldSend = await settingsService.shouldSendNotification(
        testUserId,
        "push" as NotificationChannel,
        "plm" as NotificationCategory
      );

      expect(shouldSend).toBe(true);
    });

    it("should check project-specific preference when projectId is provided", async () => {
      // Create global preference (enabled)
      await settingsService.updatePreference(testUserId, {
        channel: "in_app" as NotificationChannel,
        category: "issues" as NotificationCategory,
        enabled: true,
      });

      // Create project-specific preference (disabled)
      await settingsService.updatePreference(testUserId, {
        channel: "in_app" as NotificationChannel,
        category: "issues" as NotificationCategory,
        enabled: false,
        projectId: testProjectId,
      });

      // Should check project-specific first
      const shouldSend = await settingsService.shouldSendNotification(
        testUserId,
        "in_app" as NotificationChannel,
        "issues" as NotificationCategory,
        testProjectId
      );

      expect(shouldSend).toBe(false);
    });
  });
});
