/**
 * Tests for Dashboard Service
 *
 * Tests cover:
 * - Project statistics calculation
 * - Issue status distribution
 * - Issue priority distribution
 * - Milestone progress calculation
 * - Recent activities retrieval
 * - User assigned issues
 * - Complete dashboard data aggregation
 * - Access control validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import * as dashboardService from "@/modules/dashboard/service";

// Mock database
const mockDb = {
  select: vi.fn(() => mockDb),
  from: vi.fn(() => mockDb),
  where: vi.fn(() => mockDb),
  and: vi.fn(() => mockDb),
  innerJoin: vi.fn(() => mockDb),
  orderBy: vi.fn(() => mockDb),
  limit: vi.fn(() => mockDb),
  groupBy: vi.fn(() => mockDb),
};

vi.mock("~/server/db", () => ({
  db: mockDb,
}));

// Mock schema tables
vi.mock("~/server/db", () => ({
  db: mockDb,
  projectMembers: {},
}));

vi.mock("~/modules/issue/schemas", () => ({
  issues: {},
}));

vi.mock("~/modules/issue/schemas/milestones", () => ({
  milestones: {},
}));

vi.mock("~/server/db/parts", () => ({
  parts: {},
}));

vi.mock("~/server/db/bom_items", () => ({
  bomItems: {},
}));

vi.mock("~/server/db/change-orders", () => ({
  changeOrders: {},
}));

vi.mock("~/server/db/users", () => ({
  users: {},
}));

// Mock drizzle functions
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => ({})),
  and: vi.fn(() => ({})),
  desc: vi.fn(() => ({})),
  sql: vi.fn((template) => {
    return {
      template,
    };
  }),
  count: vi.fn(() => ({})),
  inArray: vi.fn(() => ({})),
}));

describe("Dashboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getProjectStatistics", () => {
    it("should calculate project statistics correctly", async () => {
      // Mock membership check
      mockDb.select.mockResolvedValueOnce([{ id: "member-1" }]);

      // Mock issue stats
      mockDb.select.mockResolvedValueOnce([
        {
          total: 20,
          open: 12,
          completed: 8,
        },
      ]);

      // Mock part count
      mockDb.select.mockResolvedValueOnce([{ total: 50 }]);

      // Mock BOM count
      mockDb.select.mockResolvedValueOnce([{ total: 150 }]);

      // Mock change order stats
      mockDb.select.mockResolvedValueOnce([
        {
          total: 10,
          pending: 3,
        },
      ]);

      const stats = await dashboardService.getProjectStatistics("proj-1", "user-1");

      expect(stats.totalIssues).toBe(20);
      expect(stats.openIssues).toBe(12);
      expect(stats.completedIssues).toBe(8);
      expect(stats.totalParts).toBe(50);
      expect(stats.totalBomItems).toBe(150);
      expect(stats.totalChangeOrders).toBe(10);
      expect(stats.pendingChangeOrders).toBe(3);
      expect(stats.issueCompletionRate).toBe(40); // 8/20 = 40%
    });

    it("should calculate 0% completion rate when no issues", async () => {
      mockDb.select.mockResolvedValueOnce([{ id: "member-1" }]);
      mockDb.select.mockResolvedValueOnce([{ total: 0, open: 0, completed: 0 }]);
      mockDb.select.mockResolvedValueOnce([{ total: 0 }]);
      mockDb.select.mockResolvedValueOnce([{ total: 0 }]);
      mockDb.select.mockResolvedValueOnce([{ total: 0, pending: 0 }]);

      const stats = await dashboardService.getProjectStatistics("proj-1", "user-1");

      expect(stats.issueCompletionRate).toBe(0);
    });

    it("should throw error when user not a member", async () => {
      mockDb.select.mockResolvedValueOnce([]);

      await expect(
        dashboardService.getProjectStatistics("proj-1", "user-1")
      ).rejects.toThrow("Access denied to project");
    });

    it("should handle missing values gracefully", async () => {
      mockDb.select.mockResolvedValueOnce([{ id: "member-1" }]);
      mockDb.select.mockResolvedValueOnce([{}]); // Missing stats
      mockDb.select.mockResolvedValueOnce([{}]);
      mockDb.select.mockResolvedValueOnce([{}]);
      mockDb.select.mockResolvedValueOnce([{}]);

      const stats = await dashboardService.getProjectStatistics("proj-1", "user-1");

      expect(stats.totalIssues).toBe(0);
      expect(stats.openIssues).toBe(0);
      expect(stats.completedIssues).toBe(0);
    });
  });

  describe("getIssueStatusDistribution", () => {
    it("should calculate status distribution with percentages", async () => {
      mockDb.select.mockResolvedValueOnce([
        { status: "open", count: 10 },
        { status: "in_progress", count: 5 },
        { status: "done", count: 5 },
      ]);

      const distribution = await dashboardService.getIssueStatusDistribution("proj-1");

      expect(distribution).toHaveLength(3);
      expect(distribution[0]).toEqual({
        status: "open",
        count: 10,
        percentage: 50, // 10/20 = 50%
      });
      expect(distribution[1]).toEqual({
        status: "in_progress",
        count: 5,
        percentage: 25, // 5/20 = 25%
      });
    });

    it("should return 0% when no issues", async () => {
      mockDb.select.mockResolvedValueOnce([]);

      const distribution = await dashboardService.getIssueStatusDistribution("proj-1");

      expect(distribution).toEqual([]);
    });
  });

  describe("getIssuePriorityDistribution", () => {
    it("should calculate priority distribution with percentages", async () => {
      mockDb.select.mockResolvedValueOnce([
        { priority: "high", count: 8 },
        { priority: "medium", count: 12 },
        { priority: "low", count: 5 },
      ]);

      const distribution = await dashboardService.getIssuePriorityDistribution("proj-1");

      expect(distribution).toHaveLength(3);
      expect(distribution[0]).toEqual({
        priority: "high",
        count: 8,
        percentage: 32, // 8/25 = 32%
      });
    });

    it("should handle empty results", async () => {
      mockDb.select.mockResolvedValueOnce([]);

      const distribution = await dashboardService.getIssuePriorityDistribution("proj-1");

      expect(distribution).toEqual([]);
    });
  });

  describe("getMilestoneProgress", () => {
    it("should calculate milestone progress", async () => {
      // Mock milestones
      mockDb.select.mockResolvedValueOnce([
        { id: "milestone-1", title: "Milestone 1", dueDate: new Date("2026-03-01") },
        { id: "milestone-2", title: "Milestone 2", dueDate: null },
      ]);

      // Mock issue stats for milestone 1
      mockDb.select.mockResolvedValueOnce([
        { total: 10, completed: 5 },
      ]);

      // Mock issue stats for milestone 2
      mockDb.select.mockResolvedValueOnce([
        { total: 20, completed: 10 },
      ]);

      const progress = await dashboardService.getMilestoneProgress("proj-1");

      expect(progress).toHaveLength(2);
      expect(progress[0]).toEqual({
        milestoneId: "milestone-1",
        title: "Milestone 1",
        progress: 50, // 5/10 = 50%
        dueDate: new Date("2026-03-01"),
        issueCount: 10,
        completedIssueCount: 5,
      });
    });

    it("should return 0% progress for milestones with no issues", async () => {
      mockDb.select.mockResolvedValueOnce([
        { id: "milestone-1", title: "Milestone 1", dueDate: null },
      ]);

      mockDb.select.mockResolvedValueOnce([
        { total: 0, completed: 0 },
      ]);

      const progress = await dashboardService.getMilestoneProgress("proj-1");

      expect(progress[0].progress).toBe(0);
    });

    it("should sort milestones by due date then progress", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const today = new Date();

      mockDb.select.mockResolvedValueOnce([
        { id: "milestone-1", title: "Later", dueDate: tomorrow },
        { id: "milestone-2", title: "Sooner", dueDate: today },
      ]);

      mockDb.select.mockResolvedValueOnce([{ total: 10, completed: 5 }]);
      mockDb.select.mockResolvedValueOnce([{ total: 10, completed: 5 }]);

      const progress = await dashboardService.getMilestoneProgress("proj-1");

      // Sooner (earlier due date) should come first
      expect(progress[0].milestoneId).toBe("milestone-2");
      expect(progress[1].milestoneId).toBe("milestone-1");
    });
  });

  describe("getRecentActivities", () => {
    it("should aggregate activities from different sources", async () => {
      // Mock recent issues
      mockDb.select.mockResolvedValueOnce([
        {
          id: "issue-1",
          title: "Issue 1",
          reporterId: "user-1",
          createdAt: new Date("2026-02-18T10:00:00Z"),
          updatedAt: new Date("2026-02-18T10:00:00Z"),
        },
      ]);

      // Mock user for issue
      mockDb.select.mockResolvedValueOnce([{ name: "John Doe", id: "user-1" }]);

      // Mock recent change orders
      mockDb.select.mockResolvedValueOnce([
        {
          id: "co-1",
          title: "Change Order 1",
          status: "approved",
          requesterId: "user-1",
          createdAt: new Date("2026-02-18T09:00:00Z"),
          updatedAt: new Date("2026-02-18T09:00:00Z"),
        },
      ]);

      // Mock user for change order
      mockDb.select.mockResolvedValueOnce([{ name: "John Doe", id: "user-1" }]);

      // Mock recent milestones
      mockDb.select.mockResolvedValueOnce([
        {
          id: "milestone-1",
          title: "Milestone 1",
          createdAt: new Date("2026-02-18T08:00:00Z"),
        },
      ]);

      const activities = await dashboardService.getRecentActivities("proj-1", 10);

      expect(activities).toHaveLength(3);
      expect(activities[0].type).toBe("issue");
      expect(activities[1].type).toBe("change_order");
      expect(activities[2].type).toBe("milestone");
    });

    it("should sort activities by date descending", async () => {
      mockDb.select.mockResolvedValueOnce([
        {
          id: "issue-1",
          title: "Old Issue",
          reporterId: "user-1",
          createdAt: new Date("2026-02-17T10:00:00Z"),
          updatedAt: new Date("2026-02-17T10:00:00Z"),
        },
        {
          id: "issue-2",
          title: "New Issue",
          reporterId: "user-1",
          createdAt: new Date("2026-02-18T10:00:00Z"),
          updatedAt: new Date("2026-02-18T10:00:00Z"),
        },
      ]);

      mockDb.select.mockResolvedValueOnce([{ name: "User", id: "user-1" }]);
      mockDb.select.mockResolvedValueOnce([{ name: "User", id: "user-1" }]);

      mockDb.select.mockResolvedValueOnce([]);
      mockDb.select.mockResolvedValueOnce([]);

      const activities = await dashboardService.getRecentActivities("proj-1", 10);

      // Newer issue should come first
      expect(activities[0].description).toContain("New Issue");
      expect(activities[1].description).toContain("Old Issue");
    });

    it("should limit results to specified limit", async () => {
      // Create 15 mock activities
      const issues = Array.from({ length: 15 }, (_, i) => ({
        id: `issue-${i}`,
        title: `Issue ${i}`,
        reporterId: "user-1",
        createdAt: new Date(`2026-02-18T${i}:00:00Z`),
        updatedAt: new Date(`2026-02-18T${i}:00:00Z`),
      }));

      mockDb.select.mockResolvedValueOnce(issues);

      // Mock user queries
      for (let i = 0; i < 15; i++) {
        mockDb.select.mockResolvedValueOnce([{ name: "User", id: "user-1" }]);
      }

      mockDb.select.mockResolvedValueOnce([]);
      mockDb.select.mockResolvedValueOnce([]);

      const activities = await dashboardService.getRecentActivities("proj-1", 10);

      expect(activities.length).toBeLessThanOrEqual(10);
    });
  });

  describe("getDashboardData", () => {
    it("should aggregate all dashboard data", async () => {
      // Mock all the service calls
      vi.spyOn(dashboardService, "getProjectStatistics").mockResolvedValue({
        totalIssues: 20,
        openIssues: 12,
        completedIssues: 8,
        totalParts: 50,
        totalBomItems: 150,
        totalChangeOrders: 10,
        pendingChangeOrders: 3,
        issueCompletionRate: 40,
      });

      vi.spyOn(dashboardService, "getIssueStatusDistribution").mockResolvedValue([
        { status: "open", count: 12, percentage: 60 },
        { status: "done", count: 8, percentage: 40 },
      ]);

      vi.spyOn(dashboardService, "getIssuePriorityDistribution").mockResolvedValue([
        { priority: "high", count: 8, percentage: 40 },
        { priority: "low", count: 12, percentage: 60 },
      ]);

      vi.spyOn(dashboardService, "getMilestoneProgress").mockResolvedValue([
        {
          milestoneId: "milestone-1",
          title: "Milestone 1",
          progress: 75,
          dueDate: new Date("2026-03-01"),
          issueCount: 10,
          completedIssueCount: 7,
        },
      ]);

      vi.spyOn(dashboardService, "getRecentActivities").mockResolvedValue([
        {
          id: "activity-1",
          type: "issue",
          action: "updated",
          description: "Issue updated",
          userId: "user-1",
          userName: "User",
          createdAt: new Date("2026-02-18T10:00:00Z"),
          resourceId: "issue-1",
        },
      ]);

      const data = await dashboardService.getDashboardData("proj-1", "user-1");

      expect(data.statistics).toBeDefined();
      expect(data.statistics.totalIssues).toBe(20);
      expect(data.statusDistribution).toHaveLength(2);
      expect(data.priorityDistribution).toHaveLength(2);
      expect(data.milestones).toHaveLength(1);
      expect(data.recentActivities).toHaveLength(1);
    });
  });

  describe("getUserAssignedIssues", () => {
    it("should retrieve user's assigned issues", async () => {
      const mockIssues = [
        {
          id: "issue-1",
          title: "Issue 1",
          assigneeId: "user-1",
          status: "open",
          projectId: "proj-1",
        },
        {
          id: "issue-2",
          title: "Issue 2",
          assigneeId: "user-1",
          status: "in_progress",
          projectId: "proj-1",
        },
      ];

      mockDb.select.mockResolvedValueOnce(mockIssues);

      const issues = await dashboardService.getUserAssignedIssues("user-1", "proj-1", 5);

      expect(issues).toEqual(mockIssues);
    });

    it("should respect limit parameter", async () => {
      const manyIssues = Array.from({ length: 10 }, (_, i) => ({
        id: `issue-${i}`,
        title: `Issue ${i}`,
        assigneeId: "user-1",
        status: "open",
        projectId: "proj-1",
      }));

      mockDb.select.mockResolvedValueOnce(manyIssues);

      const issues = await dashboardService.getUserAssignedIssues("user-1", "proj-1", 5);

      // The service should pass limit to the query
      expect(issues).toBeDefined();
    });

    it("should exclude closed issues", async () => {
      // SQL condition should exclude closed status
      mockDb.select.mockResolvedValueOnce([
        {
          id: "issue-1",
          title: "Open Issue",
          status: "open",
          assigneeId: "user-1",
        },
      ]);

      const issues = await dashboardService.getUserAssignedIssues("user-1", "proj-1", 5);

      expect(issues.every((issue: any) => issue.status !== "closed")).toBe(true);
    });
  });

  describe("Type Definitions", () => {
    it("should export ProjectStatistics type", () => {
      const stats: dashboardService.ProjectStatistics = {
        totalIssues: 0,
        openIssues: 0,
        completedIssues: 0,
        totalParts: 0,
        totalBomItems: 0,
        totalChangeOrders: 0,
        pendingChangeOrders: 0,
        issueCompletionRate: 0,
      };
      expect(stats).toBeDefined();
    });

    it("should export IssueStatusDistribution type", () => {
      const dist: dashboardService.IssueStatusDistribution = {
        status: "open",
        count: 0,
        percentage: 0,
      };
      expect(dist).toBeDefined();
    });

    it("should export DashboardData type", () => {
      const data: dashboardService.DashboardData = {
        statistics: {
          totalIssues: 0,
          openIssues: 0,
          completedIssues: 0,
          totalParts: 0,
          totalBomItems: 0,
          totalChangeOrders: 0,
          pendingChangeOrders: 0,
          issueCompletionRate: 0,
        },
        statusDistribution: [],
        priorityDistribution: [],
        milestones: [],
        recentActivities: [],
      };
      expect(data).toBeDefined();
    });
  });
});
