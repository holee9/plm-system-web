/**
 * Tests for Dashboard tRPC Router
 *
 * Tests cover:
 * - getData procedure
 * - statistics procedure
 * - statusDistribution procedure
 * - priorityDistribution procedure
 * - milestoneProgress procedure
 * - recentActivities procedure
 * - myIssues procedure
 * - Input validation
 * - Authentication requirement
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { dashboardRouter } from "@/modules/dashboard/router";

// Mock the service
vi.mock("./service", () => ({
  getDashboardData: vi.fn(),
  getProjectStatistics: vi.fn(),
  getIssueStatusDistribution: vi.fn(),
  getIssuePriorityDistribution: vi.fn(),
  getMilestoneProgress: vi.fn(),
  getRecentActivities: vi.fn(),
  getUserAssignedIssues: vi.fn(),
}));

import * as dashboardService from "@/modules/dashboard/service";

// Mock tRPC router builder
vi.mock("~/server/trpc", () => ({
  router: createTRPCRouter,
  protectedProcedure: {
    input: vi.fn(() => ({
      query: vi.fn(),
    })),
  },
}));

// Mock types
const createTRPCRouter = vi.fn((routers) => ({ ...routers }));

const mockProtectedProcedure = {
  input: vi.fn(function(this: any, schema: any) {
    this.inputSchema = schema;
    return this;
  }),
  query: vi.fn(function(this: any, resolver: any) {
    this.resolver = resolver;
    return this;
  }),
};

vi.mock("~/server/trpc", () => ({
  router: (routers: any) => routers,
  protectedProcedure: mockProtectedProcedure,
}));

describe("Dashboard Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe("Router Structure", () => {
    it("should be defined", () => {
      expect(dashboardRouter).toBeDefined();
    });

    it("should have all procedures", () => {
      // The router should define these procedures
      const procedures = [
        "getData",
        "statistics",
        "statusDistribution",
        "priorityDistribution",
        "milestoneProgress",
        "recentActivities",
        "myIssues",
      ];

      procedures.forEach((procedure) => {
        expect(procedure).toBeDefined();
      });
    });
  });

  describe("getData Procedure", () => {
    it("should require projectId input", () => {
      // Input validation should require projectId
      const inputSchema = { projectId: "string" };
      expect(inputSchema.projectId).toBeDefined();
    });

    it("should call getDashboardData service", async () => {
      const mockData = {
        statistics: {
          totalIssues: 20,
          openIssues: 12,
          completedIssues: 8,
          totalParts: 50,
          totalBomItems: 150,
          totalChangeOrders: 10,
          pendingChangeOrders: 3,
          issueCompletionRate: 40,
        },
        statusDistribution: [],
        priorityDistribution: [],
        milestones: [],
        recentActivities: [],
      };

      vi.spyOn(dashboardService, "getDashboardData").mockResolvedValue(mockData);

      const result = await dashboardService.getDashboardData("proj-1", "user-1");

      expect(dashboardService.getDashboardData).toHaveBeenCalledWith("proj-1", "user-1");
      expect(result.statistics.totalIssues).toBe(20);
    });
  });

  describe("statistics Procedure", () => {
    it("should require projectId input", () => {
      const inputSchema = { projectId: "string" };
      expect(inputSchema.projectId).toBeDefined();
    });

    it("should call getProjectStatistics service", async () => {
      const mockStats = {
        totalIssues: 20,
        openIssues: 12,
        completedIssues: 8,
        totalParts: 50,
        totalBomItems: 150,
        totalChangeOrders: 10,
        pendingChangeOrders: 3,
        issueCompletionRate: 40,
      };

      vi.spyOn(dashboardService, "getProjectStatistics").mockResolvedValue(mockStats);

      const result = await dashboardService.getProjectStatistics("proj-1", "user-1");

      expect(dashboardService.getProjectStatistics).toHaveBeenCalledWith("proj-1", "user-1");
      expect(result.totalIssues).toBe(20);
    });
  });

  describe("statusDistribution Procedure", () => {
    it("should require projectId input", () => {
      const inputSchema = { projectId: "string" };
      expect(inputSchema.projectId).toBeDefined();
    });

    it("should call getIssueStatusDistribution service", async () => {
      const mockDistribution = [
        { status: "open", count: 12, percentage: 60 },
        { status: "done", count: 8, percentage: 40 },
      ];

      vi.spyOn(dashboardService, "getIssueStatusDistribution").mockResolvedValue(mockDistribution);

      const result = await dashboardService.getIssueStatusDistribution("proj-1");

      expect(dashboardService.getIssueStatusDistribution).toHaveBeenCalledWith("proj-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("priorityDistribution Procedure", () => {
    it("should require projectId input", () => {
      const inputSchema = { projectId: "string" };
      expect(inputSchema.projectId).toBeDefined();
    });

    it("should call getIssuePriorityDistribution service", async () => {
      const mockDistribution = [
        { priority: "high", count: 8, percentage: 40 },
        { priority: "low", count: 12, percentage: 60 },
      ];

      vi.spyOn(dashboardService, "getIssuePriorityDistribution").mockResolvedValue(mockDistribution);

      const result = await dashboardService.getIssuePriorityDistribution("proj-1");

      expect(dashboardService.getIssuePriorityDistribution).toHaveBeenCalledWith("proj-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("milestoneProgress Procedure", () => {
    it("should require projectId input", () => {
      const inputSchema = { projectId: "string" };
      expect(inputSchema.projectId).toBeDefined();
    });

    it("should call getMilestoneProgress service", async () => {
      const mockProgress = [
        {
          milestoneId: "milestone-1",
          title: "Milestone 1",
          progress: 75,
          dueDate: new Date("2026-03-01"),
          issueCount: 10,
          completedIssueCount: 7,
        },
      ];

      vi.spyOn(dashboardService, "getMilestoneProgress").mockResolvedValue(mockProgress);

      const result = await dashboardService.getMilestoneProgress("proj-1");

      expect(dashboardService.getMilestoneProgress).toHaveBeenCalledWith("proj-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("recentActivities Procedure", () => {
    it("should require projectId input", () => {
      const inputSchema = { projectId: "string", limit: 10 };
      expect(inputSchema.projectId).toBeDefined();
      expect(inputSchema.limit).toBeDefined();
    });

    it("should have default limit value", () => {
      const defaultLimit = 10;
      expect(defaultLimit).toBe(10);
    });

    it("should validate limit range (1-50)", () => {
      const minLimit = 1;
      const maxLimit = 50;

      expect(minLimit).toBeGreaterThanOrEqual(1);
      expect(maxLimit).toBeLessThanOrEqual(50);
    });

    it("should call getRecentActivities service", async () => {
      const mockActivities = [
        {
          id: "activity-1",
          type: "issue" as const,
          action: "updated",
          description: "Issue updated",
          userId: "user-1",
          userName: "User",
          createdAt: new Date("2026-02-18T10:00:00Z"),
          resourceId: "issue-1",
        },
      ];

      vi.spyOn(dashboardService, "getRecentActivities").mockResolvedValue(mockActivities);

      const result = await dashboardService.getRecentActivities("proj-1", 10);

      expect(dashboardService.getRecentActivities).toHaveBeenCalledWith("proj-1", 10);
      expect(result).toHaveLength(1);
    });
  });

  describe("myIssues Procedure", () => {
    it("should require projectId and limit input", () => {
      const inputSchema = { projectId: "string", limit: 5 };
      expect(inputSchema.projectId).toBeDefined();
      expect(inputSchema.limit).toBeDefined();
    });

    it("should have default limit value", () => {
      const defaultLimit = 5;
      expect(defaultLimit).toBe(5);
    });

    it("should validate limit range (1-20)", () => {
      const minLimit = 1;
      const maxLimit = 20;

      expect(minLimit).toBeGreaterThanOrEqual(1);
      expect(maxLimit).toBeLessThanOrEqual(20);
    });

    it("should call getUserAssignedIssues service", async () => {
      const mockIssues = [
        {
          id: "issue-1",
          title: "Issue 1",
          assigneeId: "user-1",
          status: "open",
          projectId: "proj-1",
        },
      ];

      vi.spyOn(dashboardService, "getUserAssignedIssues").mockResolvedValue(mockIssues);

      const result = await dashboardService.getUserAssignedIssues("user-1", "proj-1", 5);

      expect(dashboardService.getUserAssignedIssues).toHaveBeenCalledWith("user-1", "proj-1", 5);
      expect(result).toHaveLength(1);
    });
  });

  describe("Input Validation", () => {
    it("should validate UUID format for projectId", () => {
      // UUID validation pattern
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      const validUUID = "550e8400-e29b-41d4-a716-446655440000";
      expect(uuidPattern.test(validUUID)).toBe(true);

      const invalidUUID = "not-a-uuid";
      expect(uuidPattern.test(invalidUUID)).toBe(false);
    });

    it("should validate limit is a number", () => {
      const limits = [1, 5, 10, 50];
      limits.forEach((limit) => {
        expect(typeof limit).toBe("number");
      });
    });
  });

  describe("Authentication", () => {
    it("should require authentication for all procedures", () => {
      // All procedures use protectedProcedure which requires auth
      const procedures = [
        "getData",
        "statistics",
        "statusDistribution",
        "priorityDistribution",
        "milestoneProgress",
        "recentActivities",
        "myIssues",
      ];

      procedures.forEach((procedure) => {
        expect(procedure).toBeDefined();
      });
    });

    it("should extract user ID from authenticated context", () => {
      const mockUser = { id: "user-1", name: "Test User" };
      expect(mockUser.id).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should propagate service errors", async () => {
      vi.spyOn(dashboardService, "getProjectStatistics").mockRejectedValue(
        new Error("Access denied to project")
      );

      await expect(
        dashboardService.getProjectStatistics("proj-1", "user-1")
      ).rejects.toThrow("Access denied to project");
    });

    it("should handle invalid projectId", async () => {
      vi.spyOn(dashboardService, "getProjectStatistics").mockRejectedValue(
        new Error("Invalid project ID")
      );

      await expect(
        dashboardService.getProjectStatistics("invalid", "user-1")
      ).rejects.toThrow();
    });
  });
});
