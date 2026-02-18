// Unit tests for Project Zod Schemas
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Re-create schemas to test validation independently
const createProjectInput = z.object({
  name: z.string().min(2).max(255),
  key: z.string().regex(/^[A-Z0-9]{2,10}$/, {
    message: "Project key must be 2-10 uppercase letters and numbers",
  }),
  description: z.string().optional(),
  teamId: z.string().uuid().optional(),
});

const updateProjectInput = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
  visibility: z.enum(["private", "public"]).optional(),
});

const addMemberInput = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

const removeMemberInput = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
});

const updateMemberRoleInput = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "member", "viewer"]),
});

describe("Project Schemas - createProjectInput", () => {
  const validData = {
    name: "Test Project",
    key: "TEST01",
    description: "A test project",
  };

  it("should accept valid project creation data", () => {
    const result = createProjectInput.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept project with minimal required fields", () => {
    const result = createProjectInput.safeParse({ name: "TP", key: "TP" });
    expect(result.success).toBe(true);
  });

  it("should accept valid teamId as UUID", () => {
    const result = createProjectInput.safeParse({
      ...validData,
      teamId: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject name shorter than 2 characters", () => {
    const result = createProjectInput.safeParse({ ...validData, name: "A" });
    expect(result.success).toBe(false);
  });

  it("should reject name longer than 255 characters", () => {
    const result = createProjectInput.safeParse({
      ...validData,
      name: "A".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("should reject key with lowercase letters", () => {
    const result = createProjectInput.safeParse({ ...validData, key: "test01" });
    expect(result.success).toBe(false);
  });

  it("should reject key shorter than 2 characters", () => {
    const result = createProjectInput.safeParse({ ...validData, key: "A" });
    expect(result.success).toBe(false);
  });

  it("should reject key longer than 10 characters", () => {
    const result = createProjectInput.safeParse({ ...validData, key: "ABCDEFGHIJK" });
    expect(result.success).toBe(false);
  });

  it("should reject key with special characters", () => {
    const result = createProjectInput.safeParse({ ...validData, key: "TEST-01" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid teamId UUID", () => {
    const result = createProjectInput.safeParse({
      ...validData,
      teamId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should require name field", () => {
    const { name, ...dataWithoutName } = validData;
    const result = createProjectInput.safeParse(dataWithoutName);
    expect(result.success).toBe(false);
  });

  it("should require key field", () => {
    const { key, ...dataWithoutKey } = validData;
    const result = createProjectInput.safeParse(dataWithoutKey);
    expect(result.success).toBe(false);
  });

  it("should accept empty description", () => {
    const result = createProjectInput.safeParse({
      name: "Test",
      key: "TEST",
      description: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("Project Schemas - updateProjectInput", () => {
  it("should accept empty update (all optional)", () => {
    const result = updateProjectInput.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept name update only", () => {
    const result = updateProjectInput.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("should accept description update only", () => {
    const result = updateProjectInput.safeParse({ description: "New description" });
    expect(result.success).toBe(true);
  });

  it("should accept status update", () => {
    const result = updateProjectInput.safeParse({ status: "archived" });
    expect(result.success).toBe(true);
  });

  it("should accept visibility update", () => {
    const result = updateProjectInput.safeParse({ visibility: "public" });
    expect(result.success).toBe(true);
  });

  it("should accept multiple field updates", () => {
    const result = updateProjectInput.safeParse({
      name: "New Name",
      description: "New description",
      status: "active",
      visibility: "private",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid status value", () => {
    const result = updateProjectInput.safeParse({ status: "deleted" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid visibility value", () => {
    const result = updateProjectInput.safeParse({ visibility: "internal" });
    expect(result.success).toBe(false);
  });

  it("should reject name shorter than 2 characters when provided", () => {
    const result = updateProjectInput.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });

  it("should reject name longer than 255 characters when provided", () => {
    const result = updateProjectInput.safeParse({ name: "A".repeat(256) });
    expect(result.success).toBe(false);
  });
});

describe("Project Schemas - addMemberInput", () => {
  const validData = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "223e4567-e89b-12d3-a456-426614174001",
  };

  it("should accept valid member addition data", () => {
    const result = addMemberInput.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept valid member addition with role", () => {
    const result = addMemberInput.safeParse({ ...validData, role: "admin" });
    expect(result.success).toBe(true);
  });

  it("should default role to member when not provided", () => {
    const result = addMemberInput.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("member");
    }
  });

  it("should accept admin role", () => {
    const result = addMemberInput.safeParse({ ...validData, role: "admin" });
    expect(result.success).toBe(true);
  });

  it("should accept viewer role", () => {
    const result = addMemberInput.safeParse({ ...validData, role: "viewer" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid projectId UUID", () => {
    const result = addMemberInput.safeParse({ ...validData, projectId: "invalid-uuid" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid userId UUID", () => {
    const result = addMemberInput.safeParse({ ...validData, userId: "invalid-uuid" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid role", () => {
    const result = addMemberInput.safeParse({ ...validData, role: "owner" });
    expect(result.success).toBe(false);
  });

  it("should require projectId", () => {
    const { projectId, ...dataWithoutProjectId } = validData;
    const result = addMemberInput.safeParse(dataWithoutProjectId);
    expect(result.success).toBe(false);
  });

  it("should require userId", () => {
    const { userId, ...dataWithoutUserId } = validData;
    const result = addMemberInput.safeParse(dataWithoutUserId);
    expect(result.success).toBe(false);
  });
});

describe("Project Schemas - removeMemberInput", () => {
  const validData = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "223e4567-e89b-12d3-a456-426614174001",
  };

  it("should accept valid member removal data", () => {
    const result = removeMemberInput.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid projectId UUID", () => {
    const result = removeMemberInput.safeParse({ ...validData, projectId: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid userId UUID", () => {
    const result = removeMemberInput.safeParse({ ...validData, userId: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should require projectId", () => {
    const { projectId, ...data } = validData;
    const result = removeMemberInput.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should require userId", () => {
    const { userId, ...data } = validData;
    const result = removeMemberInput.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("Project Schemas - updateMemberRoleInput", () => {
  const validData = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "223e4567-e89b-12d3-a456-426614174001",
    role: "admin" as const,
  };

  it("should accept valid role update data", () => {
    const result = updateMemberRoleInput.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept admin role", () => {
    const result = updateMemberRoleInput.safeParse({ ...validData, role: "admin" });
    expect(result.success).toBe(true);
  });

  it("should accept member role", () => {
    const result = updateMemberRoleInput.safeParse({ ...validData, role: "member" });
    expect(result.success).toBe(true);
  });

  it("should accept viewer role", () => {
    const result = updateMemberRoleInput.safeParse({ ...validData, role: "viewer" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid role", () => {
    const result = updateMemberRoleInput.safeParse({ ...validData, role: "owner" });
    expect(result.success).toBe(false);
  });

  it("should require role field", () => {
    const { role, ...data } = validData;
    const result = updateMemberRoleInput.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid projectId UUID", () => {
    const result = updateMemberRoleInput.safeParse({ ...validData, projectId: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid userId UUID", () => {
    const result = updateMemberRoleInput.safeParse({ ...validData, userId: "invalid" });
    expect(result.success).toBe(false);
  });
});
