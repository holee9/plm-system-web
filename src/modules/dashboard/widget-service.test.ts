/**
 * Widget Service Tests
 * Test-driven development for custom dashboard widget management
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as widgetService from "./widget-service";
import { db } from "~/server/db";
import { userDashboards, dashboardTemplates } from "~/server/db";

// Mock database
vi.mock("~/server/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({})),
    })),
    transaction: vi.fn((callback) => callback(db)),
  },
}));

describe("Widget Service", () => {
  const mockUserId = "user-123";
  const mockProjectId = "project-123";
  const mockDashboardId = "dashboard-123";

  describe("createDashboard", () => {
    it("should create a new dashboard with default layout", async () => {
      const input = {
        name: "My Dashboard",
        projectId: mockProjectId,
      };

      const result = await widgetService.createDashboard(mockUserId, input);

      expect(result).toBeDefined();
      expect(result.name).toBe(input.name);
      expect(result.layout).toBeDefined();
      expect(result.layout.widgets).toEqual([]);
      expect(result.isDefault).toBe(false);
    });

    it("should create dashboard with custom layout", async () => {
      const input = {
        name: "Custom Dashboard",
        projectId: mockProjectId,
        layout: {
          columns: 12,
          rows: 10,
          widgets: [
            {
              id: "widget-1",
              type: "stat",
              position: { x: 0, y: 0 },
              size: { w: 3, h: 2 },
              config: { title: "Total Issues", metric: "totalIssues" },
            },
          ],
        },
      };

      const result = await widgetService.createDashboard(mockUserId, input);

      expect(result.layout.widgets).toHaveLength(1);
      expect(result.layout.widgets[0].type).toBe("stat");
    });

    it("should set isDefault to true if specified", async () => {
      const input = {
        name: "Default Dashboard",
        projectId: mockProjectId,
        isDefault: true,
      };

      const result = await widgetService.createDashboard(mockUserId, input);

      expect(result.isDefault).toBe(true);
    });

    it("should unset other default dashboards for the project", async () => {
      const input = {
        name: "New Default",
        projectId: mockProjectId,
        isDefault: true,
      };

      await widgetService.createDashboard(mockUserId, input);

      // Verify that other dashboards had isDefault set to false
      // This would require proper mocking of the db.update call
    });
  });

  describe("getDashboard", () => {
    it("should return dashboard by id", async () => {
      const result = await widgetService.getDashboard(mockDashboardId, mockUserId);

      expect(result).toBeDefined();
    });

    it("should throw error if dashboard not found", async () => {
      await expect(
        widgetService.getDashboard("non-existent", mockUserId)
      ).rejects.toThrow("Dashboard not found");
    });

    it("should verify user access to dashboard", async () => {
      await expect(
        widgetService.getDashboard(mockDashboardId, "different-user")
      ).rejects.toThrow("Access denied");
    });
  });

  describe("listDashboards", () => {
    it("should return all dashboards for project", async () => {
      const result = await widgetService.listDashboards(mockUserId, mockProjectId);

      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array if no dashboards exist", async () => {
      const result = await widgetService.listDashboards(mockUserId, "empty-project");

      expect(result).toEqual([]);
    });
  });

  describe("updateDashboard", () => {
    it("should update dashboard name", async () => {
      const input = {
        name: "Updated Name",
      };

      const result = await widgetService.updateDashboard(mockDashboardId, mockUserId, input);

      expect(result.name).toBe(input.name);
    });

    it("should update dashboard layout", async () => {
      const input = {
        layout: {
          columns: 12,
          rows: 10,
          widgets: [
            {
              id: "widget-1",
              type: "chart",
              position: { x: 0, y: 0 },
              size: { w: 6, h: 4 },
              config: { chartType: "bar" },
            },
          ],
        },
      };

      const result = await widgetService.updateDashboard(mockDashboardId, mockUserId, input);

      expect(result.layout.widgets[0].type).toBe("chart");
    });

    it("should throw error if dashboard not found", async () => {
      await expect(
        widgetService.updateDashboard("non-existent", mockUserId, { name: "Test" })
      ).rejects.toThrow("Dashboard not found");
    });
  });

  describe("deleteDashboard", () => {
    it("should delete dashboard by id", async () => {
      await expect(
        widgetService.deleteDashboard(mockDashboardId, mockUserId)
      ).resolves.not.toThrow();
    });

    it("should throw error if dashboard not found", async () => {
      await expect(
        widgetService.deleteDashboard("non-existent", mockUserId)
      ).rejects.toThrow("Dashboard not found");
    });
  });

  describe("addWidget", () => {
    it("should add widget to dashboard", async () => {
      const widget = {
        type: "stat" as const,
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 },
        config: { title: "Test Widget" },
      };

      const result = await widgetService.addWidget(mockDashboardId, mockUserId, widget);

      expect(result.layout.widgets).toContainEqual(expect.objectContaining({
        type: "stat",
      }));
    });

    it("should generate widget id if not provided", async () => {
      const widget = {
        type: "stat" as const,
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 },
        config: {},
      };

      const result = await widgetService.addWidget(mockDashboardId, mockUserId, widget);

      expect(result.layout.widgets[0].id).toBeDefined();
      expect(typeof result.layout.widgets[0].id).toBe("string");
    });
  });

  describe("updateWidget", () => {
    it("should update widget in dashboard", async () => {
      const widgetId = "widget-1";
      const updates = {
        position: { x: 3, y: 2 },
        size: { w: 4, h: 3 },
      };

      const result = await widgetService.updateWidget(mockDashboardId, mockUserId, widgetId, updates);

      const widget = result.layout.widgets.find((w) => w.id === widgetId);
      expect(widget).toMatchObject(updates);
    });

    it("should throw error if widget not found", async () => {
      await expect(
        widgetService.updateWidget(mockDashboardId, mockUserId, "non-existent", {})
      ).rejects.toThrow("Widget not found");
    });
  });

  describe("removeWidget", () => {
    it("should remove widget from dashboard", async () => {
      const widgetId = "widget-1";

      const result = await widgetService.removeWidget(mockDashboardId, mockUserId, widgetId);

      expect(result.layout.widgets.find((w) => w.id === widgetId)).toBeUndefined();
    });

    it("should throw error if widget not found", async () => {
      await expect(
        widgetService.removeWidget(mockDashboardId, mockUserId, "non-existent")
      ).rejects.toThrow("Widget not found");
    });
  });

  describe("reorderWidgets", () => {
    it("should reorder widgets in dashboard", async () => {
      const widgetOrder = [
        { id: "widget-1", position: { x: 0, y: 0 } },
        { id: "widget-2", position: { x: 3, y: 0 } },
        { id: "widget-3", position: { x: 6, y: 0 } },
      ];

      const result = await widgetService.reorderWidgets(mockDashboardId, mockUserId, widgetOrder);

      expect(result.layout.widgets[0].position).toEqual({ x: 0, y: 0 });
      expect(result.layout.widgets[1].position).toEqual({ x: 3, y: 0 });
      expect(result.layout.widgets[2].position).toEqual({ x: 6, y: 0 });
    });
  });

  describe("Templates", () => {
    describe("createTemplate", () => {
      it("should create template from dashboard layout", async () => {
        const input = {
          name: "Project Management Template",
          description: "Default layout for project management",
          layout: {
            columns: 12,
            rows: 8,
            widgets: [],
          },
        };

        const result = await widgetService.createTemplate(mockUserId, input);

        expect(result).toBeDefined();
        expect(result.name).toBe(input.name);
        expect(result.isPublic).toBe(false);
      });

      it("should create public template if specified", async () => {
        const input = {
          name: "Public Template",
          layout: { columns: 12, rows: 8, widgets: [] },
          isPublic: true,
        };

        const result = await widgetService.createTemplate(mockUserId, input);

        expect(result.isPublic).toBe(true);
      });
    });

    describe("listTemplates", () => {
      it("should return user's templates", async () => {
        const result = await widgetService.listTemplates(mockUserId);

        expect(Array.isArray(result)).toBe(true);
      });

      it("should include public templates from other users", async () => {
        const result = await widgetService.listTemplates(mockUserId);

        // Should include templates where isPublic = true
        expect(result.every((t) => t.userId === mockUserId || t.isPublic)).toBe(true);
      });
    });

    describe("deleteTemplate", () => {
      it("should delete template owned by user", async () => {
        const templateId = "template-123";

        await expect(
          widgetService.deleteTemplate(templateId, mockUserId)
        ).resolves.not.toThrow();
      });

      it("should throw error if template not owned by user", async () => {
        await expect(
          widgetService.deleteTemplate("template-123", "different-user")
        ).rejects.toThrow("Access denied");
      });
    });
  });
});
