// Issue Tracking Core Types

/**
 * Issue status enum with state transition rules
 * Transitions:
 * - open -> in_progress, closed
 * - in_progress -> review, open, closed
 * - review -> done, in_progress, closed
 * - done -> closed, open (reopen)
 * - closed -> open (reopen)
 */
export type IssueStatus = "open" | "in_progress" | "review" | "done" | "closed";

/**
 * Issue priority levels
 */
export type IssuePriority = "urgent" | "high" | "medium" | "low" | "none";

/**
 * Issue type categorization
 */
export type IssueType = "task" | "bug" | "feature" | "improvement";

/**
 * Issue entity
 */
export interface Issue {
  id: string;
  projectId: string;
  number: number; // Sequential number within project (e.g., 1 for PLM-1)
  key: string; // Project key + number (e.g., PLM-1)
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assigneeId: string | null;
  reporterId: string;
  milestoneId: string | null;
  parentId: string | null; // For subtasks
  position: number; // For Kanban ordering
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Issue creation input
 */
export interface CreateIssueInput {
  projectId: string;
  title: string;
  description?: string;
  type?: IssueType;
  priority?: IssuePriority;
  assigneeId?: string | null;
  milestoneId?: string | null;
  parentId?: string | null;
}

/**
 * Issue update input
 */
export interface UpdateIssueInput {
  title?: string;
  description?: string | null;
  type?: IssueType;
  priority?: IssuePriority;
  assigneeId?: string | null;
  milestoneId?: string | null;
}

/**
 * Issue status transition result
 */
export interface StatusTransitionResult {
  allowed: boolean;
  newStatus: IssueStatus | null;
  error?: string;
}

/**
 * Issue comment
 */
export interface IssueComment {
  id: string;
  issueId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * New issue comment (for creation)
 */
export interface NewIssueComment {
  issueId: string;
  authorId: string;
  content: string;
}

/**
 * Label entity
 */
export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string; // Hex color (e.g., "#ff0000")
  description: string | null;
}

/**
 * New label (for creation)
 */
export interface NewLabel {
  projectId: string;
  name: string;
  color: string;
  description?: string | null;
}

/**
 * Issue-Label junction
 */
export interface IssueLabel {
  issueId: string;
  labelId: string;
}

/**
 * Milestone entity
 */
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: "open" | "closed";
  createdAt: Date;
}

/**
 * New milestone (for creation)
 */
export interface NewMilestone {
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
}

/**
 * New issue (for creation)
 */
export interface NewIssue {
  projectId: string;
  number: number;
  key: string;
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assigneeId?: string | null;
  reporterId: string;
  milestoneId?: string | null;
  parentId?: string | null;
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Issue filter options
 */
export interface IssueFilters {
  status?: IssueStatus;
  assigneeId?: string | null;
  labelIds?: string[];
  milestoneId?: string | null;
  priority?: IssuePriority;
  type?: IssueType;
  search?: string; // Search in title/description
}

/**
 * Cursor-based pagination options
 */
export interface PaginationOptions {
  limit?: number; // Max 50
  cursor?: string; // Base64 encoded cursor
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

/**
 * Issue attachment
 */
export interface IssueAttachment {
  id: string;
  issueId: string;
  fileName: string; // UUID_prefix + original name (stored file name)
  originalFileName: string; // Original file name (user provided)
  fileSize: number; // File size in bytes
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

/**
 * Upload attachment input
 */
export interface UploadAttachmentInput {
  issueId: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
}
