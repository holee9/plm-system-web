// Label Service - Label CRUD operations
import { eq, and, count } from "drizzle-orm";
import { db } from "~/server/db";
import { labels, issueLabels } from "./schemas";
import type { Label } from "./types";

/**
 * Validation errors
 */
export class LabelValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "LabelValidationError";
  }
}

/**
 * Access errors
 */
export class LabelAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LabelAccessError";
  }
}

/**
 * Not found errors
 */
export class LabelNotFoundError extends Error {
  constructor(labelId: string) {
    super(`Label with ID ${labelId} not found`);
    this.name = "LabelNotFoundError";
  }
}

/**
 * Check if user is a project admin
 */
async function isUserProjectAdmin(
  projectId: string,
  userId: string
): Promise<boolean> {
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

  return membership?.role === "admin";
}

/**
 * Get label by ID
 */
export async function getLabelById(labelId: string): Promise<Label | null> {
  const [label] = await db
    .select()
    .from(labels)
    .where(eq(labels.id, labelId))
    .limit(1);

  return label || null;
}

/**
 * Update label
 */
export async function updateLabel(
  labelId: string,
  data: {
    name?: string;
    color?: string;
    description?: string | null;
  },
  userId: string
): Promise<Label> {
  // Get existing label
  const existing = await getLabelById(labelId);
  if (!existing) {
    throw new LabelNotFoundError(labelId);
  }

  // Check access - only project admins can update labels
  const isAdmin = await isUserProjectAdmin(existing.projectId, userId);
  if (!isAdmin) {
    throw new LabelAccessError("Only project admins can update labels");
  }

  // Validate color format if provided
  if (data.color !== undefined) {
    if (!/^#[0-9A-F]{6}$/i.test(data.color)) {
      throw new LabelValidationError("color", "Color must be a valid hex color (e.g., #ff0000)");
    }
  }

  // Validate name if provided
  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new LabelValidationError("name", "Label name cannot be empty");
    }
    if (trimmedName.length > 50) {
      throw new LabelValidationError("name", "Label name must not exceed 50 characters");
    }

    // Check for duplicate name in project (excluding current label)
    const [duplicate] = await db
      .select()
      .from(labels)
      .where(
        and(
          eq(labels.projectId, existing.projectId),
          eq(labels.name, trimmedName)
        )
      )
      .limit(1);

    if (duplicate && duplicate.id !== labelId) {
      throw new LabelValidationError("name", "A label with this name already exists in the project");
    }
  }

  // Validate description if provided
  if (data.description !== undefined) {
    if (data.description !== null && data.description.length > 255) {
      throw new LabelValidationError("description", "Description must not exceed 255 characters");
    }
  }

  // Build update object
  const updateData: Partial<typeof labels.$inferInsert> = {
    ...(data.name !== undefined && { name: data.name.trim() }),
    ...(data.color !== undefined && { color: data.color.toLowerCase() }),
    ...(data.description !== undefined && { description: data.description?.trim() || null }),
  };

  // Update label
  const [updated] = await db
    .update(labels)
    .set(updateData)
    .where(eq(labels.id, labelId))
    .returning();

  return updated;
}

/**
 * Delete label
 * Only allows deletion if no issues are associated with the label
 */
export async function deleteLabel(
  labelId: string,
  userId: string
): Promise<void> {
  // Get existing label
  const existing = await getLabelById(labelId);
  if (!existing) {
    throw new LabelNotFoundError(labelId);
  }

  // Check access - only project admins can delete labels
  const isAdmin = await isUserProjectAdmin(existing.projectId, userId);
  if (!isAdmin) {
    throw new LabelAccessError("Only project admins can delete labels");
  }

  // Check for associated issues
  const [issueCount] = await db
    .select({ count: count() })
    .from(issueLabels)
    .where(eq(issueLabels.labelId, labelId))
    .limit(1);

  const associatedIssuesCount = Number(issueCount?.count || 0);

  if (associatedIssuesCount > 0) {
    throw new LabelValidationError(
      "labelId",
      `Cannot delete label: ${associatedIssuesCount} issue(s) are still associated with this label. Remove the label from all issues first.`
    );
  }

  // Delete label
  await db.delete(labels).where(eq(labels.id, labelId));
}
