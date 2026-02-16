// Milestone Service - Business logic for milestone management
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { milestones, type Milestone, type NewMilestone } from "~/server/db";

// Validation errors
export class MilestoneValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "MilestoneValidationError";
  }
}

// Access errors
export class MilestoneAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MilestoneAccessError";
  }
}

// Not found errors
export class MilestoneNotFoundError extends Error {
  constructor(milestoneId: string) {
    super(`Milestone with ID ${milestoneId} not found`);
    this.name = "MilestoneNotFoundError";
  }
}

// Project not found error
export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project with ID ${projectId} not found`);
    this.name = "ProjectNotFoundError";
  }
}

const MILESTONE_TITLE_MIN_LENGTH = 2;
const MILESTONE_TITLE_MAX_LENGTH = 255;

/**
 * Validate milestone title
 */
export function validateMilestoneTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new MilestoneValidationError("title", "Milestone title is required");
  }

  if (title.length < MILESTONE_TITLE_MIN_LENGTH) {
    throw new MilestoneValidationError(
      "title",
      `Milestone title must be at least ${MILESTONE_TITLE_MIN_LENGTH} characters`
    );
  }

  if (title.length > MILESTONE_TITLE_MAX_LENGTH) {
    throw new MilestoneValidationError(
      "title",
      `Milestone title must not exceed ${MILESTONE_TITLE_MAX_LENGTH} characters`
    );
  }
}

/**
 * Verify user has access to project
 */
async function verifyProjectAccess(
  projectId: string,
  userId: string
): Promise<void> {
  const { isUserProjectMember } = await import("./service");

  const isMember = await isUserProjectMember(projectId, userId);
  if (!isMember) {
    throw new MilestoneAccessError("You don't have access to this project");
  }
}

/**
 * Verify user is project admin
 */
async function verifyProjectAdmin(
  projectId: string,
  userId: string
): Promise<void> {
  const { isUserProjectAdmin } = await import("./service");

  const isAdmin = await isUserProjectAdmin(projectId, userId);
  if (!isAdmin) {
    throw new MilestoneAccessError("Only project admins can manage milestones");
  }
}

/**
 * Create a new milestone
 */
export async function createMilestone(
  projectId: string,
  userId: string,
  data: {
    title: string;
    description?: string;
    dueDate?: Date;
  }
): Promise<Milestone> {
  // Verify access and admin permissions
  await verifyProjectAccess(projectId, userId);
  await verifyProjectAdmin(projectId, userId);

  // Validate inputs
  validateMilestoneTitle(data.title);

  // Create milestone
  const newMilestone: NewMilestone = {
    projectId,
    title: data.title,
    description: data.description || null,
    dueDate: data.dueDate || null,
    status: "open",
  };

  const [created] = await db
    .insert(milestones)
    .values(newMilestone)
    .returning();

  return created;
}

/**
 * Get milestone by ID
 */
export async function getMilestoneById(
  milestoneId: string,
  userId: string
): Promise<Milestone | null> {
  const [milestone] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .limit(1);

  if (!milestone) {
    return null;
  }

  // Verify access to parent project
  await verifyProjectAccess(milestone.projectId, userId);

  return milestone;
}

/**
 * List milestones for a project
 */
export async function listMilestones(args: {
  projectId: string;
  userId: string;
  status?: "open" | "closed";
  limit?: number;
  offset?: number;
}): Promise<{ milestones: Milestone[]; total: number }> {
  const { projectId, userId, status, limit = 20, offset = 0 } = args;

  // Verify access
  await verifyProjectAccess(projectId, userId);

  // Build query conditions
  const conditions = [eq(milestones.projectId, projectId)];

  if (status) {
    conditions.push(eq(milestones.status, status));
  }

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(milestones)
    .where(and(...conditions));

  // Get milestones with pagination
  const milestoneList = await db
    .select()
    .from(milestones)
    .where(and(...conditions))
    .orderBy(desc(milestones.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    milestones: milestoneList,
    total: Number(count),
  };
}

/**
 * Update milestone
 */
export async function updateMilestone(
  milestoneId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    dueDate?: Date | null;
    status?: "open" | "closed";
  }
): Promise<Milestone> {
  // Get milestone first
  const existing = await getMilestoneById(milestoneId, userId);
  if (!existing) {
    throw new MilestoneNotFoundError(milestoneId);
  }

  // Verify admin permissions
  await verifyProjectAdmin(existing.projectId, userId);

  // Validate title if provided
  if (data.title !== undefined) {
    validateMilestoneTitle(data.title);
  }

  // Build update object
  const updateData: Partial<NewMilestone> = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  // Update milestone
  const [updated] = await db
    .update(milestones)
    .set(updateData)
    .where(eq(milestones.id, milestoneId))
    .returning();

  if (!updated) {
    throw new MilestoneNotFoundError(milestoneId);
  }

  return updated;
}

/**
 * Delete milestone
 */
export async function deleteMilestone(
  milestoneId: string,
  userId: string
): Promise<void> {
  // Get milestone first
  const existing = await getMilestoneById(milestoneId, userId);
  if (!existing) {
    throw new MilestoneNotFoundError(milestoneId);
  }

  // Verify admin permissions
  await verifyProjectAdmin(existing.projectId, userId);

  // Delete milestone
  await db
    .delete(milestones)
    .where(eq(milestones.id, milestoneId));
}

/**
 * Close milestone
 */
export async function closeMilestone(
  milestoneId: string,
  userId: string
): Promise<Milestone> {
  return updateMilestone(milestoneId, userId, { status: "closed" });
}

/**
 * Reopen milestone
 */
export async function reopenMilestone(
  milestoneId: string,
  userId: string
): Promise<Milestone> {
  return updateMilestone(milestoneId, userId, { status: "open" });
}
