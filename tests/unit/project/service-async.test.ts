// Unit tests for Project Service async functions with mocked DB
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database before importing the service
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
};

vi.mock("~/server/db", () => ({
  db: mockDb,
}));

// Mock the schema
const mockProjects = {};
const mockProjectMembers = {};

vi.mock("~/server/db", () => ({
  db: mockDb,
  projects: mockProjects,
  projectMembers: mockProjectMembers,
  projectMemberRoleEnum: ["admin", "member", "viewer"],
}));

describe("Project Service Async Functions (Mocked DB)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isProjectKeyDuplicate", () => {
    it("should return true when key exists", async () => {
      const { isProjectKeyDuplicate } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "existing-project" }]),
          }),
        }),
      });

      const result = await isProjectKeyDuplicate("PLM");
      expect(result).toBe(true);
    });

    it("should return false when key does not exist", async () => {
      const { isProjectKeyDuplicate } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await isProjectKeyDuplicate("NEWKEY");
      expect(result).toBe(false);
    });
  });

  describe("isUserProjectMember", () => {
    it("should return true when user is a member", async () => {
      const { isUserProjectMember } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "member-1" }]),
          }),
        }),
      });

      const result = await isUserProjectMember("project-1", "user-1");
      expect(result).toBe(true);
    });

    it("should return false when user is not a member", async () => {
      const { isUserProjectMember } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await isUserProjectMember("project-1", "user-1");
      expect(result).toBe(false);
    });
  });

  describe("getUserProjectRole", () => {
    it("should return admin role when user is admin", async () => {
      const { getUserProjectRole } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "admin" }]),
          }),
        }),
      });

      const result = await getUserProjectRole("project-1", "user-1");
      expect(result).toBe("admin");
    });

    it("should return member role when user is member", async () => {
      const { getUserProjectRole } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "member" }]),
          }),
        }),
      });

      const result = await getUserProjectRole("project-1", "user-1");
      expect(result).toBe("member");
    });

    it("should return viewer role when user is viewer", async () => {
      const { getUserProjectRole } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "viewer" }]),
          }),
        }),
      });

      const result = await getUserProjectRole("project-1", "user-1");
      expect(result).toBe("viewer");
    });

    it("should return null when user has no role", async () => {
      const { getUserProjectRole } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getUserProjectRole("project-1", "user-1");
      expect(result).toBeNull();
    });
  });

  describe("isUserProjectAdmin", () => {
    it("should return true when user is admin", async () => {
      const { isUserProjectAdmin } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "admin" }]),
          }),
        }),
      });

      const result = await isUserProjectAdmin("project-1", "user-1");
      expect(result).toBe(true);
    });

    it("should return false when user is member", async () => {
      const { isUserProjectAdmin } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "member" }]),
          }),
        }),
      });

      const result = await isUserProjectAdmin("project-1", "user-1");
      expect(result).toBe(false);
    });

    it("should return false when user is viewer", async () => {
      const { isUserProjectAdmin } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "viewer" }]),
          }),
        }),
      });

      const result = await isUserProjectAdmin("project-1", "user-1");
      expect(result).toBe(false);
    });

    it("should return false when user has no role", async () => {
      const { isUserProjectAdmin } = await import("~/modules/project/service");

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await isUserProjectAdmin("project-1", "user-1");
      expect(result).toBe(false);
    });
  });

  describe("Error handling scenarios", () => {
    it("should throw ProjectAccessError when non-admin tries to update", async () => {
      const { updateProject, ProjectAccessError } = await import("~/modules/project/service");

      // Mock isUserProjectAdmin to return false
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "member" }]),
          }),
        }),
      });

      await expect(
        updateProject("project-1", "user-1", { name: "Updated Name" })
      ).rejects.toThrow(ProjectAccessError);
    });

    it("should throw ProjectValidationError when adding existing member", async () => {
      const { addProjectMember, ProjectValidationError } = await import("~/modules/project/service");

      // Mock admin check
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ role: "admin" }]),
            }),
          }),
        })
        // Mock member check (user already exists)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: "member-1" }]),
            }),
          }),
        });

      await expect(
        addProjectMember("project-1", "user-1", "new-user", "member", "user-1")
      ).rejects.toThrow(ProjectValidationError);
    });

    it("should throw ProjectValidationError when removing yourself", async () => {
      const { removeProjectMember, ProjectValidationError } = await import("~/modules/project/service");

      // Mock admin check
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "admin" }]),
          }),
        }),
      });

      await expect(
        removeProjectMember("project-1", "user-1", "user-1")
      ).rejects.toThrow(ProjectValidationError);
    });

    it("should throw ProjectValidationError when changing own role", async () => {
      const { updateMemberRole, ProjectValidationError } = await import("~/modules/project/service");

      // Mock admin check
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ role: "admin" }]),
          }),
        }),
      });

      await expect(
        updateMemberRole("project-1", "user-1", "viewer", "user-1")
      ).rejects.toThrow(ProjectValidationError);
    });
  });
});

describe("Milestone Service Internal Functions (Not Exported)", () => {
  // Note: verifyProjectAccess and verifyProjectAdmin are not exported
  // These tests document that they are internal functions
  it("should export public milestone functions", async () => {
    const milestoneService = await import("~/modules/project/milestone-service");
    expect(typeof milestoneService.createMilestone).toBe("function");
    expect(typeof milestoneService.getMilestoneById).toBe("function");
    expect(typeof milestoneService.listMilestones).toBe("function");
    expect(typeof milestoneService.updateMilestone).toBe("function");
    expect(typeof milestoneService.deleteMilestone).toBe("function");
    expect(typeof milestoneService.closeMilestone).toBe("function");
    expect(typeof milestoneService.reopenMilestone).toBe("function");
  });

  it("should not export internal helper functions", async () => {
    const milestoneService = await import("~/modules/project/milestone-service");
    // These functions are not exported, they are internal
    expect((milestoneService as any).verifyProjectAccess).toBeUndefined();
    expect((milestoneService as any).verifyProjectAdmin).toBeUndefined();
  });
});
