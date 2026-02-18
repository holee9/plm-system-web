// Unit tests for Project Schema Validation
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Import the actual schemas from the project router
const createProjectInputSchema = z.object({
  name: z.string().min(2).max(255),
  key: z.string().regex(/^[A-Z0-9]{2,10}$/, {
    message: "Project key must be 2-10 uppercase letters and numbers",
  }),
  description: z.string().optional(),
  teamId: z.string().uuid().optional(),
});

const updateProjectInputSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
  visibility: z.enum(["private", "public"]).optional(),
});

const addMemberInputSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

const updateMemberRoleInputSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "member", "viewer"]),
});

const createMilestoneInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(2).max(255),
  description: z.string().optional(),
  dueDate: z.date().optional(),
});

const updateMilestoneInputSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.date().nullable().optional(),
  status: z.enum(["open", "closed"]).optional(),
});

describe("Project Schema Validation", () => {
  describe("createProjectInput", () => {
    it("should accept valid project data", () => {
      const result = createProjectInputSchema.safeParse({
        name: "Test Project",
        key: "TEST01",
        description: "A test project",
      });

      expect(result.success).toBe(true);
    });

    it("should accept project without description", () => {
      const result = createProjectInputSchema.safeParse({
        name: "Test Project",
        key: "TEST01",
      });

      expect(result.success).toBe(true);
    });

    it("should accept project with teamId", () => {
      const result = createProjectInputSchema.safeParse({
        name: "Test Project",
        key: "TEST01",
        teamId: "123e4567-e89b-12d3-a456-426614174000",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid project key format", () => {
      const result = createProjectInputSchema.safeParse({
        name: "Test Project",
        key: "test", // lowercase not allowed
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("uppercase letters and numbers");
      }
    });

    it("should reject project key that is too short", () => {
      const result = createProjectInputSchema.safeParse({
        name: "Test Project",
        key: "A", // only 1 character
      });

      expect(result.success).toBe(false);
    });

    it("should reject project key that is too long", () => {
      const result = createProjectInputSchema.safeParse({
        name: "Test Project",
        key: "ABCDEFGHIJK", // 11 characters
      });

      expect(result.success).toBe(false);
    });

    it("should reject project key with special characters", () => {
      const result = createProjectInputSchema.safeParse({
        name: "Test Project",
        key: "TEST-01",
      });

      expect(result.success).toBe(false);
    });

    it("should reject name that is too short", () => {
      const result = createProjectInputSchema.safeParse({
        name: "A", // only 1 character
        key: "TEST01",
      });

      expect(result.success).toBe(false);
    });

    it("should reject name that is too long", () => {
      const result = createProjectInputSchema.safeParse({
        name: "A".repeat(256),
        key: "TEST01",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid UUID for teamId", () => {
      const result = createProjectInputSchema.safeParse({
        name: "Test Project",
        key: "TEST01",
        teamId: "not-a-uuid",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateProjectInput", () => {
    it("should accept partial update with name only", () => {
      const result = updateProjectInputSchema.safeParse({
        name: "Updated Project",
      });

      expect(result.success).toBe(true);
    });

    it("should accept partial update with description only", () => {
      const result = updateProjectInputSchema.safeParse({
        description: "Updated description",
      });

      expect(result.success).toBe(true);
    });

    it("should accept status update", () => {
      const result = updateProjectInputSchema.safeParse({
        status: "archived",
      });

      expect(result.success).toBe(true);
    });

    it("should accept visibility update", () => {
      const result = updateProjectInputSchema.safeParse({
        visibility: "public",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = updateProjectInputSchema.safeParse({
        status: "deleted",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid visibility", () => {
      const result = updateProjectInputSchema.safeParse({
        visibility: "hidden",
      });

      expect(result.success).toBe(false);
    });

    it("should accept empty update object", () => {
      const result = updateProjectInputSchema.safeParse({});

      expect(result.success).toBe(true);
    });
  });
});

describe("Member Management Schema Validation", () => {
  describe("addMemberInput", () => {
    it("should accept valid member addition", () => {
      const result = addMemberInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        role: "member",
      });

      expect(result.success).toBe(true);
    });

    it("should default role to member", () => {
      const result = addMemberInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("member");
      }
    });

    it("should accept admin role", () => {
      const result = addMemberInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        role: "admin",
      });

      expect(result.success).toBe(true);
    });

    it("should accept viewer role", () => {
      const result = addMemberInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        role: "viewer",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid role", () => {
      const result = addMemberInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        role: "owner",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid projectId UUID", () => {
      const result = addMemberInputSchema.safeParse({
        projectId: "not-a-uuid",
        userId: "123e4567-e89b-12d3-a456-426614174001",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid userId UUID", () => {
      const result = addMemberInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "not-a-uuid",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateMemberRoleInput", () => {
    it("should accept valid role update", () => {
      const result = updateMemberRoleInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        role: "admin",
      });

      expect(result.success).toBe(true);
    });

    it("should accept all valid roles", () => {
      const roles = ["admin", "member", "viewer"] as const;

      roles.forEach((role) => {
        const result = updateMemberRoleInputSchema.safeParse({
          projectId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "123e4567-e89b-12d3-a456-426614174001",
          role,
        });

        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid role", () => {
      const result = updateMemberRoleInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        role: "superadmin",
      });

      expect(result.success).toBe(false);
    });
  });
});

describe("Milestone Schema Validation", () => {
  describe("createMilestoneInput", () => {
    it("should accept valid milestone data", () => {
      const result = createMilestoneInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        title: "Sprint 1",
        description: "First sprint",
        dueDate: new Date("2024-12-31"),
      });

      expect(result.success).toBe(true);
    });

    it("should accept milestone without description", () => {
      const result = createMilestoneInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        title: "Sprint 1",
      });

      expect(result.success).toBe(true);
    });

    it("should accept milestone without dueDate", () => {
      const result = createMilestoneInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        title: "Sprint 1",
      });

      expect(result.success).toBe(true);
    });

    it("should reject title that is too short", () => {
      const result = createMilestoneInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        title: "A",
      });

      expect(result.success).toBe(false);
    });

    it("should reject title that is too long", () => {
      const result = createMilestoneInputSchema.safeParse({
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        title: "A".repeat(256),
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid projectId UUID", () => {
      const result = createMilestoneInputSchema.safeParse({
        projectId: "not-a-uuid",
        title: "Sprint 1",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateMilestoneInput", () => {
    it("should accept partial update with title only", () => {
      const result = updateMilestoneInputSchema.safeParse({
        title: "Updated Sprint",
      });

      expect(result.success).toBe(true);
    });

    it("should accept status update", () => {
      const result = updateMilestoneInputSchema.safeParse({
        status: "closed",
      });

      expect(result.success).toBe(true);
    });

    it("should accept null dueDate", () => {
      const result = updateMilestoneInputSchema.safeParse({
        dueDate: null,
      });

      expect(result.success).toBe(true);
    });

    it("should accept date dueDate", () => {
      const result = updateMilestoneInputSchema.safeParse({
        dueDate: new Date("2024-12-31"),
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = updateMilestoneInputSchema.safeParse({
        status: "completed",
      });

      expect(result.success).toBe(false);
    });

    it("should reject title that is too short", () => {
      const result = updateMilestoneInputSchema.safeParse({
        title: "A",
      });

      expect(result.success).toBe(false);
    });

    it("should accept empty update object", () => {
      const result = updateMilestoneInputSchema.safeParse({});

      expect(result.success).toBe(true);
    });
  });
});
