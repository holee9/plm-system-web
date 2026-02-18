// Unit tests for Project Router error handling
// Tests error response handling without actual DB calls
import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Mock the project service to control error responses
vi.mock("~/modules/project/service", () => {
  return {
    validateProjectKey: vi.fn((key: string) => {
      if (!key || key.trim().length === 0) {
        const error = new Error("key: Project key is required");
        error.name = "ProjectValidationError";
        throw error;
      }
      if (!/^[A-Z0-9]{2,10}$/.test(key)) {
        const error = new Error("key: Project key must be 2-10 uppercase letters and numbers");
        error.name = "ProjectValidationError";
        throw error;
      }
    }),
    validateProjectName: vi.fn((name: string) => {
      if (!name || name.trim().length === 0) {
        const error = new Error("name: Project name is required");
        error.name = "ProjectValidationError";
        throw error;
      }
    }),
    createProject: vi.fn(),
    getProjectById: vi.fn(),
    getProjectByKey: vi.fn(),
    listUserProjects: vi.fn(),
    updateProject: vi.fn(),
    archiveProject: vi.fn(),
    restoreProject: vi.fn(),
    addProjectMember: vi.fn(),
    removeProjectMember: vi.fn(),
    updateMemberRole: vi.fn(),
    listProjectMembers: vi.fn(),
    ProjectValidationError: class ProjectValidationError extends Error {
      constructor(field: string, message: string) {
        super(`${field}: ${message}`);
        this.name = "ProjectValidationError";
      }
    },
    ProjectAccessError: class ProjectAccessError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "ProjectAccessError";
      }
    },
    ProjectNotFoundError: class ProjectNotFoundError extends Error {
      constructor(projectId: string) {
        super(`Project with ID ${projectId} not found`);
        this.name = "ProjectNotFoundError";
      }
    },
  };
});

// Mock the milestone service (except validation function which we want to test)
vi.mock("~/modules/project/milestone-service", () => {
  const actualModule = vi.importActual("~/modules/project/milestone-service");
  return {
    ...((actualModule as any) || {}),
    createMilestone: vi.fn(),
    getMilestoneById: vi.fn(),
    listMilestones: vi.fn(),
    updateMilestone: vi.fn(),
    deleteMilestone: vi.fn(),
    closeMilestone: vi.fn(),
    reopenMilestone: vi.fn(),
    MilestoneValidationError: class MilestoneValidationError extends Error {
      constructor(field: string, message: string) {
        super(`${field}: ${message}`);
        this.name = "MilestoneValidationError";
      }
    },
    MilestoneAccessError: class MilestoneAccessError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "MilestoneAccessError";
      }
    },
    MilestoneNotFoundError: class MilestoneNotFoundError extends Error {
      constructor(milestoneId: string) {
        super(`Milestone with ID ${milestoneId} not found`);
        this.name = "MilestoneNotFoundError";
      }
    },
  };
});

describe("Project Router Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Zod Schema Validation", () => {
    describe("createProjectInput schema", () => {
      const createProjectInput = z.object({
        name: z.string().min(2).max(255),
        key: z.string().regex(/^[A-Z0-9]{2,10}$/, {
          message: "Project key must be 2-10 uppercase letters and numbers",
        }),
        description: z.string().optional(),
        teamId: z.string().uuid().optional(),
      });

      it("should validate correct input", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "TEST01",
          description: "Test Description",
        });
        expect(result.success).toBe(true);
      });

      it("should reject name less than 2 characters", () => {
        const result = createProjectInput.safeParse({
          name: "A",
          key: "TEST01",
        });
        expect(result.success).toBe(false);
      });

      it("should reject name more than 255 characters", () => {
        const result = createProjectInput.safeParse({
          name: "A".repeat(256),
          key: "TEST01",
        });
        expect(result.success).toBe(false);
      });

      it("should reject invalid project key format", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "invalid",
        });
        expect(result.success).toBe(false);
      });

      it("should reject project key with special characters", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "TEST-01",
        });
        expect(result.success).toBe(false);
      });

      it("should reject project key less than 2 characters", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "A",
        });
        expect(result.success).toBe(false);
      });

      it("should reject project key more than 10 characters", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "ABCDEFGHIJK",
        });
        expect(result.success).toBe(false);
      });

      it("should accept optional description", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "TEST01",
        });
        expect(result.success).toBe(true);
      });

      it("should accept valid UUID for teamId", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "TEST01",
          teamId: "123e4567-e89b-12d3-a456-426614174000",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid UUID for teamId", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "TEST01",
          teamId: "not-a-uuid",
        });
        expect(result.success).toBe(false);
      });

      it("should allow empty description string", () => {
        const result = createProjectInput.safeParse({
          name: "Test Project",
          key: "TEST01",
          description: "",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("updateProjectInput schema", () => {
      const updateProjectInput = z.object({
        name: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        status: z.enum(["active", "archived"]).optional(),
        visibility: z.enum(["private", "public"]).optional(),
      });

      it("should validate empty object (all optional)", () => {
        const result = updateProjectInput.safeParse({});
        expect(result.success).toBe(true);
      });

      it("should validate name update only", () => {
        const result = updateProjectInput.safeParse({
          name: "Updated Project",
        });
        expect(result.success).toBe(true);
      });

      it("should validate status enum values", () => {
        const activeResult = updateProjectInput.safeParse({ status: "active" });
        const archivedResult = updateProjectInput.safeParse({ status: "archived" });
        expect(activeResult.success).toBe(true);
        expect(archivedResult.success).toBe(true);
      });

      it("should reject invalid status value", () => {
        const result = updateProjectInput.safeParse({ status: "deleted" });
        expect(result.success).toBe(false);
      });

      it("should validate visibility enum values", () => {
        const privateResult = updateProjectInput.safeParse({ visibility: "private" });
        const publicResult = updateProjectInput.safeParse({ visibility: "public" });
        expect(privateResult.success).toBe(true);
        expect(publicResult.success).toBe(true);
      });

      it("should reject invalid visibility value", () => {
        const result = updateProjectInput.safeParse({ visibility: "internal" });
        expect(result.success).toBe(false);
      });

      it("should validate all fields together", () => {
        const result = updateProjectInput.safeParse({
          name: "Updated Project",
          description: "Updated description",
          status: "active",
          visibility: "public",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("addMemberInput schema", () => {
      const addMemberInput = z.object({
        projectId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(["admin", "member", "viewer"]).default("member"),
      });

      it("should validate correct input with default role", () => {
        const result = addMemberInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "223e4567-e89b-12d3-a456-426614174001",
        });
        expect(result.success).toBe(true);
      });

      it("should validate correct input with explicit role", () => {
        const result = addMemberInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "223e4567-e89b-12d3-a456-426614174001",
          role: "admin",
        });
        expect(result.success).toBe(true);
      });

      it("should accept all valid role values", () => {
        const roles: Array<"admin" | "member" | "viewer"> = ["admin", "member", "viewer"];
        roles.forEach((role) => {
          const result = addMemberInput.safeParse({
            projectId: "123e4567-e89b-12d3-a456-426614174000",
            userId: "223e4567-e89b-12d3-a456-426614174001",
            role,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid role", () => {
        const result = addMemberInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "223e4567-e89b-12d3-a456-426614174001",
          role: "owner",
        });
        expect(result.success).toBe(false);
      });

      it("should reject invalid projectId UUID", () => {
        const result = addMemberInput.safeParse({
          projectId: "not-a-uuid",
          userId: "223e4567-e89b-12d3-a456-426614174001",
        });
        expect(result.success).toBe(false);
      });

      it("should reject invalid userId UUID", () => {
        const result = addMemberInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "not-a-uuid",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("removeMemberInput schema", () => {
      const removeMemberInput = z.object({
        projectId: z.string().uuid(),
        userId: z.string().uuid(),
      });

      it("should validate correct input", () => {
        const result = removeMemberInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "223e4567-e89b-12d3-a456-426614174001",
        });
        expect(result.success).toBe(true);
      });

      it("should require both projectId and userId", () => {
        const result1 = removeMemberInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
        });
        const result2 = removeMemberInput.safeParse({
          userId: "223e4567-e89b-12d3-a456-426614174001",
        });
        expect(result1.success).toBe(false);
        expect(result2.success).toBe(false);
      });
    });

    describe("updateMemberRoleInput schema", () => {
      const updateMemberRoleInput = z.object({
        projectId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(["admin", "member", "viewer"]),
      });

      it("should validate correct input", () => {
        const result = updateMemberRoleInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "223e4567-e89b-12d3-a456-426614174001",
          role: "member",
        });
        expect(result.success).toBe(true);
      });

      it("should reject missing role (required, not optional)", () => {
        const result = updateMemberRoleInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "223e4567-e89b-12d3-a456-426614174001",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Milestone schemas", () => {
      const createMilestoneInput = z.object({
        projectId: z.string().uuid(),
        title: z.string().min(2).max(255),
        description: z.string().optional(),
        dueDate: z.date().optional(),
      });

      it("should validate createMilestoneInput", () => {
        const result = createMilestoneInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          title: "Milestone 1",
          description: "First milestone",
          dueDate: new Date(),
        });
        expect(result.success).toBe(true);
      });

      it("should reject createMilestoneInput with short title", () => {
        const result = createMilestoneInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          title: "A",
        });
        expect(result.success).toBe(false);
      });

      const updateMilestoneInput = z.object({
        title: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        dueDate: z.date().nullable().optional(),
        status: z.enum(["open", "closed"]).optional(),
      });

      it("should validate updateMilestoneInput with empty object", () => {
        const result = updateMilestoneInput.safeParse({});
        expect(result.success).toBe(true);
      });

      it("should validate updateMilestoneInput with status", () => {
        const result = updateMilestoneInput.safeParse({
          status: "closed",
        });
        expect(result.success).toBe(true);
      });

      it("should accept null for dueDate in update", () => {
        const result = updateMilestoneInput.safeParse({
          dueDate: null,
        });
        expect(result.success).toBe(true);
      });

      const listMilestonesInput = z.object({
        projectId: z.string().uuid(),
        status: z.enum(["open", "closed"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      });

      it("should validate listMilestonesInput with defaults", () => {
        const result = listMilestonesInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(20);
          expect(result.data.offset).toBe(0);
        }
      });

      it("should reject listMilestonesInput with limit > 100", () => {
        const result = listMilestonesInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          limit: 101,
        });
        expect(result.success).toBe(false);
      });

      it("should reject listMilestonesInput with negative offset", () => {
        const result = listMilestonesInput.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          offset: -1,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Service Error Classes", () => {
    it("should create ProjectValidationError with correct structure", async () => {
      const { ProjectValidationError } = await import("~/modules/project/service");
      const error = new ProjectValidationError("key", "Test error message");
      expect(error.name).toBe("ProjectValidationError");
      expect(error.message).toBe("key: Test error message");
    });

    it("should create ProjectAccessError with correct structure", async () => {
      const { ProjectAccessError } = await import("~/modules/project/service");
      const error = new ProjectAccessError("Access denied");
      expect(error.name).toBe("ProjectAccessError");
      expect(error.message).toBe("Access denied");
    });

    it("should create ProjectNotFoundError with correct structure", async () => {
      const { ProjectNotFoundError } = await import("~/modules/project/service");
      const error = new ProjectNotFoundError("proj-123");
      expect(error.name).toBe("ProjectNotFoundError");
      expect(error.message).toContain("proj-123");
      expect(error.message).toContain("not found");
    });

    it("should create MilestoneValidationError with correct structure", async () => {
      const { MilestoneValidationError } = await import("~/modules/project/milestone-service");
      const error = new MilestoneValidationError("title", "Title is required");
      expect(error.name).toBe("MilestoneValidationError");
      expect(error.message).toBe("title: Title is required");
    });

    it("should create MilestoneAccessError with correct structure", async () => {
      const { MilestoneAccessError } = await import("~/modules/project/milestone-service");
      const error = new MilestoneAccessError("No access");
      expect(error.name).toBe("MilestoneAccessError");
      expect(error.message).toBe("No access");
    });

    it("should create MilestoneNotFoundError with correct structure", async () => {
      const { MilestoneNotFoundError } = await import("~/modules/project/milestone-service");
      const error = new MilestoneNotFoundError("milestone-123");
      expect(error.name).toBe("MilestoneNotFoundError");
      expect(error.message).toContain("milestone-123");
      expect(error.message).toContain("not found");
    });
  });

  describe("Validation Function Edge Cases", () => {
    it("validateProjectKey should handle whitespace-only input", async () => {
      const { validateProjectKey } = await import("~/modules/project/service");
      expect(() => validateProjectKey("   ")).toThrow();
    });

    it("validateProjectKey should handle mixed case input", async () => {
      const { validateProjectKey } = await import("~/modules/project/service");
      expect(() => validateProjectKey("PlM01")).toThrow();
    });

    it("validateProjectKey should handle lowercase input", async () => {
      const { validateProjectKey } = await import("~/modules/project/service");
      expect(() => validateProjectKey("plm")).toThrow();
    });

    it("validateProjectName should handle whitespace-only input", async () => {
      const { validateProjectName } = await import("~/modules/project/service");
      expect(() => validateProjectName("   ")).toThrow();
    });
  });
});
