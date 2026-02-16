// Issue Attachment Service - Business logic for issue file attachments
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { issueAttachments } from "./schemas/issue-attachments";
import { getIssueById, isUserProjectMember } from "./service";
import type { IssueAttachment } from "./types";

// Validation errors
export class AttachmentValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "AttachmentValidationError";
  }
}

// Access errors
export class AttachmentAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttachmentAccessError";
  }
}

// Not found errors
export class AttachmentNotFoundError extends Error {
  constructor(attachmentId: string) {
    super(`Attachment with ID ${attachmentId} not found`);
    this.name = "AttachmentNotFoundError";
  }
}

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_ATTACHMENTS_PER_ISSUE = 10;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text
  "text/plain",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
];

// File extension to MIME type mapping
const EXTENSION_MIME_MAP: Record<string, string> = {
  // Images
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  // Documents
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".json": "application/json",
  ".xml": "application/xml",
};

/**
 * Check if file size is valid
 */
export function validateFileSize(fileSize: number): void {
  if (fileSize <= 0) {
    throw new AttachmentValidationError("fileSize", "File size must be greater than 0");
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new AttachmentValidationError(
      "fileSize",
      `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }
}

/**
 * Check if MIME type is allowed
 */
export function validateMimeType(mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AttachmentValidationError(
      "mimeType",
      `File type ${mimeType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromFileName(fileName: string): string {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  return EXTENSION_MIME_MAP[ext] || "application/octet-stream";
}

/**
 * Check if issue has reached maximum attachments
 */
export async function checkAttachmentLimit(issueId: string): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(issueAttachments)
    .where(eq(issueAttachments.issueId, issueId));

  if (count >= MAX_ATTACHMENTS_PER_ISSUE) {
    throw new AttachmentValidationError(
      "issueId",
      `Maximum ${MAX_ATTACHMENTS_PER_ISSUE} attachments per issue allowed`
    );
  }
}

/**
 * Check if user is project admin
 */
export async function isUserProjectAdmin(
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
 * Generate unique file name with UUID prefix
 */
export function generateUniqueFileName(originalFileName: string): string {
  const uuid = crypto.randomUUID();
  // Preserve file extension
  const ext = originalFileName.slice(originalFileName.lastIndexOf("."));
  return `${uuid}_${originalFileName}`;
}

/**
 * Upload attachment to an issue
 */
export async function uploadAttachment(
  issueId: string,
  originalFileName: string,
  fileSize: number,
  mimeType: string,
  userId: string
): Promise<IssueAttachment> {
  // Get issue to verify access
  const issue = await getIssueById(issueId);
  if (!issue) {
    throw new AttachmentNotFoundError(issueId);
  }

  // Check access
  const isMember = await isUserProjectMember(issue.projectId, userId);
  if (!isMember) {
    throw new AttachmentAccessError("You must be a project member to upload attachments");
  }

  // Validate file size
  validateFileSize(fileSize);

  // Validate MIME type
  validateMimeType(mimeType);

  // Check attachment limit
  await checkAttachmentLimit(issueId);

  // Generate unique file name
  const fileName = generateUniqueFileName(originalFileName);

  // Create attachment record
  const [created] = await db
    .insert(issueAttachments)
    .values({
      issueId,
      fileName,
      originalFileName,
      fileSize,
      mimeType,
      uploadedBy: userId,
    })
    .returning();

  return created;
}

/**
 * Get attachment by ID
 */
export async function getAttachmentById(attachmentId: string): Promise<IssueAttachment | null> {
  const [attachment] = await db
    .select()
    .from(issueAttachments)
    .where(eq(issueAttachments.id, attachmentId))
    .limit(1);

  return attachment || null;
}

/**
 * List attachments for an issue
 */
export async function listAttachments(issueId: string): Promise<IssueAttachment[]> {
  return db
    .select()
    .from(issueAttachments)
    .where(eq(issueAttachments.issueId, issueId))
    .orderBy(desc(issueAttachments.uploadedAt));
}

/**
 * Delete attachment
 */
export async function deleteAttachment(
  attachmentId: string,
  userId: string
): Promise<void> {
  // Get attachment
  const attachment = await getAttachmentById(attachmentId);
  if (!attachment) {
    throw new AttachmentNotFoundError(attachmentId);
  }

  // Get issue to check permissions
  const issue = await getIssueById(attachment.issueId);
  if (!issue) {
    throw new AttachmentNotFoundError(attachment.issueId);
  }

  // Check if user is uploader or project admin
  const isUploader = attachment.uploadedBy === userId;
  const isAdmin = await isUserProjectAdmin(issue.projectId, userId);

  if (!isUploader && !isAdmin) {
    throw new AttachmentAccessError(
      "You must be the uploader or a project admin to delete attachments"
    );
  }

  // Delete attachment record
  await db
    .delete(issueAttachments)
    .where(eq(issueAttachments.id, attachmentId));
}
