// Project Service - Business logic for project management
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  projects,
  projectMembers,
  projectMemberRoleEnum,
  type Project,
  type NewProject,
  type ProjectMember,
  type NewProjectMember,
} from "~/server/db";

// Type alias for project member role
type ProjectMemberRole = "admin" | "member" | "viewer";

// Validation patterns
const PROJECT_KEY_PATTERN = /^[A-Z0-9]{2,10}$/;
const PROJECT_NAME_MIN_LENGTH = 2;
const PROJECT_NAME_MAX_LENGTH = 255;

// Validation errors
export class ProjectValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "ProjectValidationError";
  }
}

// Access errors
export class ProjectAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectAccessError";
  }
}

// Not found errors
export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project with ID ${projectId} not found`);
    this.name = "ProjectNotFoundError";
  }
}

/**
 * Validate project key format
 * Requirements: Uppercase letters + numbers, 2-10 characters
 */
export function validateProjectKey(key: string): void {
  if (!key || key.trim().length === 0) {
    throw new ProjectValidationError("key", "Project key is required");
  }

  if (!PROJECT_KEY_PATTERN.test(key)) {
    throw new ProjectValidationError(
      "key",
      "Project key must be 2-10 uppercase letters and numbers only (e.g., PLM, PROJ01)"
    );
  }
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ProjectValidationError("name", "Project name is required");
  }

  if (name.length < PROJECT_NAME_MIN_LENGTH) {
    throw new ProjectValidationError(
      "name",
      `Project name must be at least ${PROJECT_NAME_MIN_LENGTH} characters`
    );
  }

  if (name.length > PROJECT_NAME_MAX_LENGTH) {
    throw new ProjectValidationError(
      "name",
      `Project name must not exceed ${PROJECT_NAME_MAX_LENGTH} characters`
    );
  }
}

/**
 * Check if project key already exists
 */
export async function isProjectKeyDuplicate(key: string): Promise<boolean> {
  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.key, key))
    .limit(1);

  return existing.length > 0;
}

/**
 * Check if user is a project member
 */
export async function isUserProjectMember(
  projectId: string,
  userId: string
): Promise<boolean> {
  const membership = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .limit(1);

  return membership.length > 0;
}

/**
 * Get user's role in project
 */
export async function getUserProjectRole(
  projectId: string,
  userId: string
): Promise<ProjectMemberRole | null> {
  const membership = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .limit(1);

  return membership.length > 0 ? membership[0].role : null;
}

/**
 * Check if user has admin or higher role in project
 */
export async function isUserProjectAdmin(
  projectId: string,
  userId: string
): Promise<boolean> {
  const role = await getUserProjectRole(projectId, userId);
  return role === "admin";
}

/**
 * Create a new project
 */
export async function createProject(
  data: {
    name: string;
    key: string;
    description?: string;
    teamId?: string;
    createdBy: string;
  },
  userId: string
): Promise<Project> {
  // Validate inputs
  validateProjectName(data.name);
  validateProjectKey(data.key);

  // Check for duplicate key
  if (await isProjectKeyDuplicate(data.key)) {
    throw new ProjectValidationError("key", `Project key "${data.key}" already exists`);
  }

  // Start transaction
  return db.transaction(async (tx) => {
    // Create project
    const newProject: NewProject = {
      name: data.name,
      key: data.key.toUpperCase(),
      description: data.description || null,
      status: "active",
      teamId: data.teamId || null,
      createdBy: data.createdBy,
    };

    const [created] = await tx
      .insert(projects)
      .values(newProject)
      .returning();

    // Add creator as admin member
    const newMember: NewProjectMember = {
      projectId: created.id,
      userId: userId,
      role: "admin",
    };

    await tx.insert(projectMembers).values(newMember);

    return created;
  });
}

/**
 * Get project by ID
 */
export async function getProjectById(
  projectId: string,
  userId: string
): Promise<Project | null> {
  // Check access first
  const isMember = await isUserProjectMember(projectId, userId);
  if (!isMember) {
    throw new ProjectAccessError("You don't have access to this project");
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return project || null;
}

/**
 * Get project by key
 */
export async function getProjectByKey(
  key: string,
  userId: string
): Promise<Project | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.key, key.toUpperCase()))
    .limit(1);

  if (!project) {
    return null;
  }

  // Check access
  const isMember = await isUserProjectMember(project.id, userId);
  if (!isMember) {
    throw new ProjectAccessError("You don't have access to this project");
  }

  return project;
}

/**
 * List user's projects
 */
export async function listUserProjects(args: {
  userId: string;
  status?: "active" | "archived";
  limit?: number;
  offset?: number;
}): Promise<{ projects: Project[]; total: number }> {
  const { userId, status, limit = 20, offset = 0 } = args;

  // Build query conditions
  const conditions = [
    eq(projectMembers.userId, userId),
  ];

  if (status) {
    conditions.push(eq(projects.status, status));
  }

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(and(...conditions));

  // Get projects with pagination
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      key: projects.key,
      description: projects.description,
      status: projects.status,
      teamId: projects.teamId,
      createdBy: projects.createdBy,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(desc(projects.updatedAt))
    .limit(limit)
    .offset(offset);

  return {
    projects: userProjects as Project[],
    total: Number(count),
  };
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    status?: "active" | "archived";
    visibility?: "private" | "public";
  }
): Promise<Project> {
  // Check admin access
  const isAdmin = await isUserProjectAdmin(projectId, userId);
  if (!isAdmin) {
    throw new ProjectAccessError("Only project admins can update projects");
  }

  // Validate if name is being updated
  if (data.name !== undefined) {
    validateProjectName(data.name);
  }

  // Build update object
  const updateData: Partial<NewProject> = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.visibility !== undefined && { visibility: data.visibility }),
    updatedAt: new Date(),
  };

  // Update project
  const [updated] = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, projectId))
    .returning();

  if (!updated) {
    throw new ProjectNotFoundError(projectId);
  }

  return updated;
}

/**
 * Archive project
 */
export async function archiveProject(
  projectId: string,
  userId: string
): Promise<Project> {
  return updateProject(projectId, userId, { status: "archived" });
}

/**
 * Restore archived project
 */
export async function restoreProject(
  projectId: string,
  userId: string
): Promise<Project> {
  return updateProject(projectId, userId, { status: "active" });
}

/**
 * Add member to project
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  newMemberUserId: string,
  role: ProjectMemberRole = "member",
  requestingUserId: string
): Promise<ProjectMember> {
  // Check admin access
  const isAdmin = await isUserProjectAdmin(projectId, requestingUserId);
  if (!isAdmin) {
    throw new ProjectAccessError("Only project admins can add members");
  }

  // Check if user is already a member
  const isMember = await isUserProjectMember(projectId, newMemberUserId);
  if (isMember) {
    throw new ProjectValidationError("userId", "User is already a project member");
  }

  // Add member
  const [newMember] = await db
    .insert(projectMembers)
    .values({
      projectId,
      userId: newMemberUserId,
      role,
    })
    .returning();

  return newMember;
}

/**
 * Remove member from project
 */
export async function removeProjectMember(
  projectId: string,
  memberUserId: string,
  requestingUserId: string
): Promise<void> {
  // Check admin access
  const isAdmin = await isUserProjectAdmin(projectId, requestingUserId);
  if (!isAdmin) {
    throw new ProjectAccessError("Only project admins can remove members");
  }

  // Cannot remove yourself
  if (memberUserId === requestingUserId) {
    throw new ProjectValidationError("userId", "Cannot remove yourself from project");
  }

  // Remove member
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, memberUserId)
      )
    );
}

/**
 * Update member role
 */
export async function updateMemberRole(
  projectId: string,
  memberUserId: string,
  newRole: ProjectMemberRole,
  requestingUserId: string
): Promise<ProjectMember> {
  // Check admin access
  const isAdmin = await isUserProjectAdmin(projectId, requestingUserId);
  if (!isAdmin) {
    throw new ProjectAccessError("Only project admins can update member roles");
  }

  // Cannot change your own role
  if (memberUserId === requestingUserId) {
    throw new ProjectValidationError("userId", "Cannot change your own role");
  }

  // Update role
  const [updated] = await db
    .update(projectMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, memberUserId)
      )
    )
    .returning();

  if (!updated) {
    throw new ProjectValidationError("userId", "Member not found in project");
  }

  return updated;
}

/**
 * List project members
 */
export async function listProjectMembers(
  projectId: string,
  requestingUserId: string
): Promise<ProjectMember[]> {
  // Check access
  const isMember = await isUserProjectMember(projectId, requestingUserId);
  if (!isMember) {
    throw new ProjectAccessError("You don't have access to this project");
  }

  const members = await db
    .select()
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));

  return members;
}
