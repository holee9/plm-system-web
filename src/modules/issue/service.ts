// Issue Service - Business logic for issue tracking
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { projects } from "~/server/db";
import {
  issues,
  issueComments,
  labels,
  issueLabels,
  milestones,
} from "./schemas";
import type {
  Issue,
  NewIssue,
  IssueComment,
  NewIssueComment,
  Label,
  NewLabel,
  Milestone,
  NewMilestone,
  CreateIssueInput,
  UpdateIssueInput,
  IssueStatus,
  IssueFilters,
  PaginationOptions,
  PaginatedResult,
} from "./types";
import { isValidStatusTransition } from "./status-machine";

// Validation errors
export class IssueValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "IssueValidationError";
  }
}

// Access errors
export class IssueAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IssueAccessError";
  }
}

// Not found errors
export class IssueNotFoundError extends Error {
  constructor(issueId: string) {
    super(`Issue with ID ${issueId} not found`);
    this.name = "IssueNotFoundError";
  }
}

// State transition errors
export class InvalidStatusTransitionError extends Error {
  constructor(currentStatus: IssueStatus, newStatus: IssueStatus) {
    super(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    this.name = "InvalidStatusTransitionError";
  }
}

/**
 * Validate issue title
 */
export function validateIssueTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new IssueValidationError("title", "Issue title is required");
  }

  if (title.length > 500) {
    throw new IssueValidationError("title", "Issue title must not exceed 500 characters");
  }
}

/**
 * Get next issue number for a project
 */
export async function getNextIssueNumber(projectId: string): Promise<number> {
  const result = await db
    .select({ maxNumber: sql<number>`MAX(number)` })
    .from(issues)
    .where(eq(issues.projectId, projectId));

  const maxNumber = result[0]?.maxNumber || 0;
  return maxNumber + 1;
}

/**
 * Generate issue key (e.g., PLM-1)
 */
export async function generateIssueKey(projectId: string): Promise<string> {
  // Get project key
  const [project] = await db
    .select({ key: projects.key })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    throw new IssueNotFoundError(projectId);
  }

  // Get next issue number
  const number = await getNextIssueNumber(projectId);

  return `${project.key}-${number}`;
}

/**
 * Check if user is a project member
 */
export async function isUserProjectMember(
  projectId: string,
  userId: string
): Promise<boolean> {
  const { projectMembers } = await import("~/server/db");
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
 * Create a new issue
 */
export async function createIssue(
  data: CreateIssueInput,
  reporterId: string
): Promise<Issue> {
  // Validate title
  validateIssueTitle(data.title);

  // Check access
  const isMember = await isUserProjectMember(data.projectId, reporterId);
  if (!isMember) {
    throw new IssueAccessError("You must be a project member to create issues");
  }

  // Validate assignee if provided
  if (data.assigneeId) {
    const isAssigneeMember = await isUserProjectMember(data.projectId, data.assigneeId);
    if (!isAssigneeMember) {
      throw new IssueValidationError("assigneeId", "Assignee must be a project member");
    }
  }

  // Validate milestone if provided
  if (data.milestoneId) {
    const [milestone] = await db
      .select()
      .from(milestones)
      .where(eq(milestones.id, data.milestoneId))
      .limit(1);

    if (!milestone || milestone.projectId !== data.projectId) {
      throw new IssueValidationError("milestoneId", "Invalid milestone");
    }
  }

  // Generate issue key and number
  const key = await generateIssueKey(data.projectId);
  const number = await getNextIssueNumber(data.projectId);

  // Create issue
  const newIssue: NewIssue = {
    projectId: data.projectId,
    number,
    key,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    status: "open",
    priority: data.priority || "none",
    type: data.type || "task",
    assigneeId: data.assigneeId || null,
    reporterId,
    milestoneId: data.milestoneId || null,
    parentId: data.parentId || null,
    position: 0,
  };

  const [created] = await db.insert(issues).values(newIssue).returning();
  return created;
}

/**
 * Get issue by ID
 */
export async function getIssueById(issueId: string): Promise<Issue | null> {
  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, issueId))
    .limit(1);

  return issue || null;
}

/**
 * Get issue by key (e.g., PLM-1)
 */
export async function getIssueByKey(key: string): Promise<Issue | null> {
  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.key, key.toUpperCase()))
    .limit(1);

  return issue || null;
}

/**
 * Get issue by project key and number
 */
export async function getIssueByProjectKeyNumber(
  projectKey: string,
  number: number
): Promise<Issue | null> {
  const key = `${projectKey.toUpperCase()}-${number}`;
  return getIssueByKey(key);
}

/**
 * Update issue
 */
export async function updateIssue(
  issueId: string,
  data: UpdateIssueInput,
  userId: string
): Promise<Issue> {
  // Get existing issue
  const existing = await getIssueById(issueId);
  if (!existing) {
    throw new IssueNotFoundError(issueId);
  }

  // Check access
  const isMember = await isUserProjectMember(existing.projectId, userId);
  if (!isMember) {
    throw new IssueAccessError("You must be a project member to update issues");
  }

  // Validate title if provided
  if (data.title !== undefined) {
    validateIssueTitle(data.title);
  }

  // Validate assignee if provided
  if (data.assigneeId !== undefined) {
    if (data.assigneeId) {
      const isAssigneeMember = await isUserProjectMember(existing.projectId, data.assigneeId);
      if (!isAssigneeMember) {
        throw new IssueValidationError("assigneeId", "Assignee must be a project member");
      }
    }
  }

  // Validate milestone if provided
  if (data.milestoneId !== undefined) {
    if (data.milestoneId) {
      const [milestone] = await db
        .select()
        .from(milestones)
        .where(eq(milestones.id, data.milestoneId))
        .limit(1);

      if (!milestone || milestone.projectId !== existing.projectId) {
        throw new IssueValidationError("milestoneId", "Invalid milestone");
      }
    }
  }

  // Build update object
  const updateData: Partial<NewIssue> = {
    ...(data.title !== undefined && { title: data.title.trim() }),
    ...(data.description !== undefined && { description: data.description?.trim() || null }),
    ...(data.type !== undefined && { type: data.type }),
    ...(data.priority !== undefined && { priority: data.priority }),
    ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
    ...(data.milestoneId !== undefined && { milestoneId: data.milestoneId }),
    updatedAt: new Date(),
  };

  // Update issue
  const [updated] = await db
    .update(issues)
    .set(updateData)
    .where(eq(issues.id, issueId))
    .returning();

  return updated;
}

/**
 * Update issue status with transition validation
 */
export async function updateIssueStatus(
  issueId: string,
  newStatus: IssueStatus,
  userId: string
): Promise<Issue> {
  // Get existing issue
  const existing = await getIssueById(issueId);
  if (!existing) {
    throw new IssueNotFoundError(issueId);
  }

  // Check access
  const isMember = await isUserProjectMember(existing.projectId, userId);
  if (!isMember) {
    throw new IssueAccessError("You must be a project member to update issues");
  }

  // Validate transition
  if (!isValidStatusTransition(existing.status, newStatus)) {
    throw new InvalidStatusTransitionError(existing.status, newStatus);
  }

  // Update status
  const [updated] = await db
    .update(issues)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, issueId))
    .returning();

  return updated;
}

/**
 * Update issue position (for Kanban board)
 */
export async function updateIssuePosition(
  issueId: string,
  newStatus: IssueStatus,
  newPosition: number,
  userId: string
): Promise<Issue> {
  // Get existing issue
  const existing = await getIssueById(issueId);
  if (!existing) {
    throw new IssueNotFoundError(issueId);
  }

  // Check access
  const isMember = await isUserProjectMember(existing.projectId, userId);
  if (!isMember) {
    throw new IssueAccessError("You must be a project member to update issues");
  }

  // Validate transition if status changed
  if (existing.status !== newStatus) {
    if (!isValidStatusTransition(existing.status, newStatus)) {
      throw new InvalidStatusTransitionError(existing.status, newStatus);
    }
  }

  // Update position and status
  const [updated] = await db
    .update(issues)
    .set({
      status: newStatus,
      position: newPosition,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, issueId))
    .returning();

  return updated;
}

/**
 * List issues with filters and pagination
 */
export async function listIssues(
  projectId: string,
  filters: IssueFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<Issue>> {
  const limit = Math.min(pagination.limit || 50, 50);
  const conditions = [eq(issues.projectId, projectId)];

  // Apply filters
  if (filters.status) {
    conditions.push(eq(issues.status, filters.status));
  }

  if (filters.assigneeId !== undefined) {
    if (filters.assigneeId === null) {
      conditions.push(sql`${issues.assigneeId} IS NULL`);
    } else {
      conditions.push(eq(issues.assigneeId, filters.assigneeId));
    }
  }

  if (filters.priority) {
    conditions.push(eq(issues.priority, filters.priority));
  }

  if (filters.type) {
    conditions.push(eq(issues.type, filters.type));
  }

  if (filters.milestoneId !== undefined) {
    if (filters.milestoneId === null) {
      conditions.push(sql`${issues.milestoneId} IS NULL`);
    } else {
      conditions.push(eq(issues.milestoneId, filters.milestoneId));
    }
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      sql`${issues.title} ILIKE ${searchTerm} OR ${issues.description} ILIKE ${searchTerm}`
    );
  }

  // Label filtering requires subquery
  let issueIdsForLabels: string[] | null = null;
  if (filters.labelIds && filters.labelIds.length > 0) {
    const labelResults = await db
      .select({ issueId: issueLabels.issueId })
      .from(issueLabels)
      .where(inArray(issueLabels.labelId, filters.labelIds));

    issueIdsForLabels = [...new Set(labelResults.map((r) => r.issueId))];

    if (issueIdsForLabels.length === 0) {
      // No issues match the label filter
      return {
        items: [],
        nextCursor: null,
        hasMore: false,
        total: 0,
      };
    }
  }

  // Add label filter to conditions
  if (issueIdsForLabels) {
    conditions.push(inArray(issues.id, issueIdsForLabels));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(issues)
    .where(whereClause);

  // Get issues with ordering
  const issuesList = await db
    .select()
    .from(issues)
    .where(whereClause)
    .orderBy(desc(issues.createdAt), asc(issues.number))
    .limit(limit);

  return {
    items: issuesList,
    nextCursor: null, // TODO: Implement cursor-based pagination
    hasMore: false, // TODO: Implement cursor-based pagination
    total: Number(count),
  };
}

/**
 * Create issue comment
 */
export async function createIssueComment(
  issueId: string,
  content: string,
  authorId: string
): Promise<IssueComment> {
  // Get issue to verify access
  const issue = await getIssueById(issueId);
  if (!issue) {
    throw new IssueNotFoundError(issueId);
  }

  // Check access
  const isMember = await isUserProjectMember(issue.projectId, authorId);
  if (!isMember) {
    throw new IssueAccessError("You must be a project member to comment");
  }

  // Create comment
  const newComment: NewIssueComment = {
    issueId,
    authorId,
    content: content.trim(),
  };

  const [created] = await db.insert(issueComments).values(newComment).returning();
  return created;
}

/**
 * List comments for an issue
 */
export async function listIssueComments(issueId: string): Promise<IssueComment[]> {
  return db
    .select()
    .from(issueComments)
    .where(eq(issueComments.issueId, issueId))
    .orderBy(asc(issueComments.createdAt));
}

/**
 * Create label
 */
export async function createLabel(
  projectId: string,
  name: string,
  color: string,
  description?: string,
  userId: string
): Promise<Label> {
  // Check access
  const { projectMembers } = await import("~/server/db");
  const [membership] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .limit(1);

  if (!membership || membership.role !== "admin") {
    throw new IssueAccessError("Only project admins can create labels");
  }

  // Validate color format
  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    throw new IssueValidationError("color", "Color must be a valid hex color (e.g., #ff0000)");
  }

  // Create label
  const newLabel: NewLabel = {
    projectId,
    name: name.trim(),
    color: color.toLowerCase(),
    description: description?.trim() || null,
  };

  const [created] = await db.insert(labels).values(newLabel).returning();
  return created;
}

/**
 * List labels for a project
 */
export async function listLabels(projectId: string): Promise<Label[]> {
  return db
    .select()
    .from(labels)
    .where(eq(labels.projectId, projectId))
    .orderBy(asc(labels.name));
}

/**
 * Assign label to issue
 */
export async function assignLabelToIssue(
  issueId: string,
  labelId: string,
  userId: string
): Promise<void> {
  // Get issue to verify access
  const issue = await getIssueById(issueId);
  if (!issue) {
    throw new IssueNotFoundError(issueId);
  }

  // Check access
  const isMember = await isUserProjectMember(issue.projectId, userId);
  if (!isMember) {
    throw new IssueAccessError("You must be a project member to assign labels");
  }

  // Verify label belongs to project
  const [label] = await db
    .select()
    .from(labels)
    .where(eq(labels.id, labelId))
    .limit(1);

  if (!label || label.projectId !== issue.projectId) {
    throw new IssueValidationError("labelId", "Label not found in this project");
  }

  // Check if already assigned
  const [existing] = await db
    .select()
    .from(issueLabels)
    .where(
      and(
        eq(issueLabels.issueId, issueId),
        eq(issueLabels.labelId, labelId)
      )
    )
    .limit(1);

  if (existing) {
    return; // Already assigned
  }

  // Assign label
  await db.insert(issueLabels).values({
    issueId,
    labelId,
  });
}

/**
 * Unassign label from issue
 */
export async function unassignLabelFromIssue(
  issueId: string,
  labelId: string,
  userId: string
): Promise<void> {
  // Get issue to verify access
  const issue = await getIssueById(issueId);
  if (!issue) {
    throw new IssueNotFoundError(issueId);
  }

  // Check access
  const isMember = await isUserProjectMember(issue.projectId, userId);
  if (!isMember) {
    throw new IssueAccessError("You must be a project member to unassign labels");
  }

  // Remove assignment
  await db
    .delete(issueLabels)
    .where(
      and(
        eq(issueLabels.issueId, issueId),
        eq(issueLabels.labelId, labelId)
      )
    );
}

/**
 * Create milestone
 */
export async function createMilestone(
  projectId: string,
  title: string,
  userId: string,
  description?: string,
  dueDate?: Date
): Promise<Milestone> {
  // Check access
  const { projectMembers } = await import("~/server/db");
  const [membership] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .limit(1);

  if (!membership || membership.role !== "admin") {
    throw new IssueAccessError("Only project admins can create milestones");
  }

  // Create milestone
  const newMilestone: NewMilestone = {
    projectId,
    title: title.trim(),
    description: description?.trim() || null,
    dueDate: dueDate || null,
  };

  const [created] = await db.insert(milestones).values(newMilestone).returning();
  return created;
}

/**
 * List milestones for a project
 */
export async function listMilestones(projectId: string): Promise<Milestone[]> {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.dueDate));
}
