/**
 * Change Order Service
 * Business logic for ECR/ECN workflow with approval process and audit trail
 */
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import {
  changeOrders,
  changeOrderApprovers,
  changeOrderAuditTrail,
  changeOrderAffectedParts,
  type ChangeOrder,
  type NewChangeOrder,
  type ChangeOrderApprover,
  type NewChangeOrderApprover,
  type ChangeOrderAuditTrail as AuditTrail,
  type NewChangeOrderAuditTrail,
  type ChangeOrderAffectedPart,
  type NewChangeOrderAffectedPart,
} from "~/server/db/change-orders";
import { projects } from "~/server/db/projects";
import { users } from "~/server/db/users";
import {
  publishChangeOrderCreated,
  publishChangeOrderStatusChanged,
  publishChangeOrderSubmitted,
  publishChangeOrderApproved,
  publishChangeOrderRejected,
  publishChangeOrderImplemented,
} from "./events";

// ============================================================================
// Type Definitions
// ============================================================================

export type ChangeOrderType = "ECR" | "ECN";
export type ChangeOrderStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "implemented";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface CreateChangeOrderInput {
  projectId: string;
  type: ChangeOrderType;
  title: string;
  description: string;
  reason: string;
  approverIds: string[]; // List of user IDs who must approve
  affectedPartIds?: string[]; // Parts affected by this change
}

export interface UpdateChangeOrderInput {
  changeOrderId: string;
  title?: string;
  description?: string;
  reason?: string;
  approverIds?: string[];
  affectedPartIds?: string[];
}

export interface SubmitChangeOrderInput {
  changeOrderId: string;
}

export interface ReviewChangeOrderInput {
  changeOrderId: string;
  status: "approved" | "rejected";
  comment?: string;
}

export interface ImplementChangeOrderInput {
  changeOrderId: string;
  revisionId?: string; // Link to implemented part revision
}

export interface ChangeOrderWithDetails extends ChangeOrder {
  requesterName?: string;
  projectName?: string;
  approvers?: ChangeOrderApprover[];
  auditTrail?: AuditTrail[];
  affectedParts?: ChangeOrderAffectedPart[];
  approvalProgress?: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  };
}

export interface ChangeOrderListFilters {
  status?: ChangeOrderStatus;
  type?: ChangeOrderType;
  requesterId?: string;
  limit?: number;
  offset?: number;
}

export interface ImpactAnalysisResult {
  affectedParts: Array<{
    partId: string;
    partNumber?: string;
    name?: string;
    impactDescription?: string;
  }>;
  whereUsedCount: number;
  relatedChangeOrders: Array<{
    id: string;
    number: string;
    title: string;
    status: ChangeOrderStatus;
  }>;
}

// ============================================================================
// Validation Constants
// ============================================================================

const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 500;
const DESCRIPTION_MIN_LENGTH = 10;

// ============================================================================
// Status Transition Rules
// ============================================================================

const ALLOWED_TRANSITIONS: Record<ChangeOrderStatus, ChangeOrderStatus[]> = {
  draft: ["submitted", "rejected"],
  submitted: ["in_review", "rejected"],
  in_review: ["approved", "rejected", "submitted"],
  approved: ["implemented"],
  rejected: ["submitted"],
  implemented: [],
};

function isValidStatusTransition(
  currentStatus: ChangeOrderStatus,
  newStatus: ChangeOrderStatus
): boolean {
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateTitle(title: string): void {
  if (!title || title.trim().length < TITLE_MIN_LENGTH) {
    throw new Error(`Title must be at least ${TITLE_MIN_LENGTH} characters`);
  }
  if (title.length > TITLE_MAX_LENGTH) {
    throw new Error(`Title must not exceed ${TITLE_MAX_LENGTH} characters`);
  }
}

function validateDescription(description: string): void {
  if (!description || description.trim().length < DESCRIPTION_MIN_LENGTH) {
    throw new Error(`Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`);
  }
}

function validateReason(reason: string): void {
  if (!reason || reason.trim().length === 0) {
    throw new Error("Reason is required");
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getNextChangeOrderNumber(
  projectId: string,
  type: ChangeOrderType
): Promise<string> {
  const result = await db
    .select({ maxNumber: sql<number>`MAX(CAST(number AS INTEGER))` })
    .from(changeOrders)
    .where(
      and(
        eq(changeOrders.projectId, projectId),
        eq(changeOrders.type, type)
      )
    );

  const maxNumber = result[0]?.maxNumber || 0;
  return String(maxNumber + 1).padStart(3, "0"); // E.g., "001", "002"
}

/**
 * JSON-serializable value type for audit metadata
 */
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

async function auditStatusChange(
  changeOrderId: string,
  fromStatus: ChangeOrderStatus,
  toStatus: ChangeOrderStatus,
  changedBy: string,
  comment?: string,
  metadata?: Record<string, JsonValue>
): Promise<void> {
  const auditEntry: NewChangeOrderAuditTrail = {
    changeOrderId,
    fromStatus,
    toStatus,
    changedBy,
    comment,
    metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
  };
  await db.insert(changeOrderAuditTrail).values(auditEntry);
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Create a new change order (ECR or ECN)
 */
export async function createChangeOrder(
  input: CreateChangeOrderInput,
  requesterId: string
): Promise<ChangeOrderWithDetails> {
  // Validate inputs
  validateTitle(input.title);
  validateDescription(input.description);
  validateReason(input.reason);

  // Validate approvers
  if (!input.approverIds || input.approverIds.length === 0) {
    throw new Error("At least one approver is required");
  }

  // Verify all approvers exist
  const approversResult = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.id, input.approverIds));

  if (approversResult.length !== input.approverIds.length) {
    throw new Error("One or more approvers not found");
  }

  // Verify project exists
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .limit(1);

  if (!project) {
    throw new Error("Project not found");
  }

  // Generate change order number
  const number = await getNextChangeOrderNumber(input.projectId, input.type);

  // Create change order with approvers in transaction
  return db.transaction(async (tx) => {
    // Create change order
    const newChangeOrder: NewChangeOrder = {
      projectId: input.projectId,
      type: input.type,
      number,
      title: input.title.trim(),
      description: input.description.trim(),
      reason: input.reason.trim(),
      status: "draft",
      requesterId,
    };

    const [created] = await tx
      .insert(changeOrders)
      .values(newChangeOrder)
      .returning();

    // Add approvers
    const approverEntries: NewChangeOrderApprover[] = input.approverIds.map(
      (approverId) => ({
        changeOrderId: created.id,
        approverId,
        status: "pending",
      })
    );
    await tx.insert(changeOrderApprovers).values(approverEntries);

    // Add affected parts if provided
    if (input.affectedPartIds && input.affectedPartIds.length > 0) {
      const affectedPartEntries: NewChangeOrderAffectedPart[] = input.affectedPartIds.map(
        (partId) => ({
          changeOrderId: created.id,
          partId,
          impactDescription: null,
        })
      );
      await tx.insert(changeOrderAffectedParts).values(affectedPartEntries);
    }

    // Emit change order created event
    publishChangeOrderCreated({
      changeOrderId: created.id,
      projectId: created.projectId,
      type: created.type,
      number: created.number,
      title: created.title,
      requesterId: created.requesterId,
      approverIds: input.approverIds,
      affectedPartIds: input.affectedPartIds,
    });

    // Return with details
    return getChangeOrderById(created.id, requesterId) as Promise<ChangeOrderWithDetails>;
  });
}

/**
 * Get change order by ID with full details
 */
export async function getChangeOrderById(
  changeOrderId: string,
  userId: string
): Promise<ChangeOrderWithDetails | null> {
  const [changeOrder] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, changeOrderId))
    .limit(1);

  if (!changeOrder) {
    return null;
  }

  // Get requester details
  const [requester] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, changeOrder.requesterId))
    .limit(1);

  // Get project details
  const [project] = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, changeOrder.projectId))
    .limit(1);

  // Get approvers
  const approvers = await db
    .select()
    .from(changeOrderApprovers)
    .where(eq(changeOrderApprovers.changeOrderId, changeOrderId));

  // Get audit trail
  const auditTrail = await db
    .select()
    .from(changeOrderAuditTrail)
    .where(eq(changeOrderAuditTrail.changeOrderId, changeOrderId))
    .orderBy(desc(changeOrderAuditTrail.createdAt));

  // Get affected parts
  const affectedParts = await db
    .select()
    .from(changeOrderAffectedParts)
    .where(eq(changeOrderAffectedParts.changeOrderId, changeOrderId));

  // Calculate approval progress
  const total = approvers.length;
  const approved = approvers.filter((a) => a.status === "approved").length;
  const rejected = approvers.filter((a) => a.status === "rejected").length;
  const pending = approvers.filter((a) => a.status === "pending").length;

  return {
    ...changeOrder,
    requesterName: requester?.name,
    projectName: project?.name,
    approvers,
    auditTrail,
    affectedParts,
    approvalProgress: { total, approved, rejected, pending },
  };
}

/**
 * Update change order (only allowed in draft status)
 */
export async function updateChangeOrder(
  input: UpdateChangeOrderInput,
  userId: string
): Promise<ChangeOrderWithDetails> {
  const [existing] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, input.changeOrderId))
    .limit(1);

  if (!existing) {
    throw new Error("Change order not found");
  }

  if (existing.status !== "draft") {
    throw new Error("Only draft change orders can be modified");
  }

  if (existing.requesterId !== userId) {
    throw new Error("Only the requester can modify the change order");
  }

  // Validate inputs if provided
  if (input.title !== undefined) validateTitle(input.title);
  if (input.description !== undefined) validateDescription(input.description);
  if (input.reason !== undefined) validateReason(input.reason);

  return db.transaction(async (tx) => {
    // Update change order
    const updateData: Partial<NewChangeOrder> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description.trim();
    if (input.reason !== undefined) updateData.reason = input.reason.trim();

    await tx
      .update(changeOrders)
      .set(updateData)
      .where(eq(changeOrders.id, input.changeOrderId));

    // Update approvers if provided
    if (input.approverIds) {
      // Delete existing approvers
      await tx
        .delete(changeOrderApprovers)
        .where(eq(changeOrderApprovers.changeOrderId, input.changeOrderId));

      // Add new approvers
      const approverEntries: NewChangeOrderApprover[] = input.approverIds.map(
        (approverId) => ({
          changeOrderId: input.changeOrderId,
          approverId,
          status: "pending",
        })
      );
      await tx.insert(changeOrderApprovers).values(approverEntries);
    }

    // Update affected parts if provided
    if (input.affectedPartIds !== undefined) {
      // Delete existing affected parts
      await tx
        .delete(changeOrderAffectedParts)
        .where(eq(changeOrderAffectedParts.changeOrderId, input.changeOrderId));

      // Add new affected parts
      if (input.affectedPartIds.length > 0) {
        const affectedPartEntries: NewChangeOrderAffectedPart[] = input.affectedPartIds.map(
          (partId) => ({
            changeOrderId: input.changeOrderId,
            partId,
            impactDescription: null,
          })
        );
        await tx.insert(changeOrderAffectedParts).values(affectedPartEntries);
      }
    }

    return getChangeOrderById(input.changeOrderId, userId) as Promise<ChangeOrderWithDetails>;
  });
}

/**
 * Submit change order for review
 */
export async function submitChangeOrder(
  input: SubmitChangeOrderInput,
  userId: string
): Promise<ChangeOrderWithDetails> {
  const [existing] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, input.changeOrderId))
    .limit(1);

  if (!existing) {
    throw new Error("Change order not found");
  }

  if (existing.requesterId !== userId) {
    throw new Error("Only the requester can submit the change order");
  }

  const newStatus: ChangeOrderStatus = "submitted";
  if (!isValidStatusTransition(existing.status, newStatus)) {
    throw new Error(`Cannot submit change order from ${existing.status} status`);
  }

  return db.transaction(async (tx) => {
    // Update status
    await tx
      .update(changeOrders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(changeOrders.id, input.changeOrderId));

    // Audit the change
    await auditStatusChange(
      input.changeOrderId,
      existing.status,
      newStatus,
      userId,
      "Submitted for review"
    );

    // Emit status changed event
    publishChangeOrderStatusChanged({
      changeOrderId: input.changeOrderId,
      fromStatus: existing.status,
      toStatus: newStatus,
      changedBy: userId,
      comment: "Submitted for review",
    });

    // Emit submitted event
    publishChangeOrderSubmitted({
      changeOrderId: existing.id,
      type: existing.type,
      number: existing.number,
      title: existing.title,
      projectId: existing.projectId,
      submittedBy: userId,
      submittedAt: new Date(),
    });

    return getChangeOrderById(input.changeOrderId, userId) as Promise<ChangeOrderWithDetails>;
  });
}

/**
 * Accept change order for review (move to in_review)
 */
export async function acceptForReview(
  changeOrderId: string,
  userId: string
): Promise<ChangeOrderWithDetails> {
  const [existing] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, changeOrderId))
    .limit(1);

  if (!existing) {
    throw new Error("Change order not found");
  }

  const newStatus: ChangeOrderStatus = "in_review";
  if (!isValidStatusTransition(existing.status, newStatus)) {
    throw new Error(`Cannot accept change order from ${existing.status} status`);
  }

  return db.transaction(async (tx) => {
    await tx
      .update(changeOrders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(changeOrders.id, changeOrderId));

    await auditStatusChange(
      changeOrderId,
      existing.status,
      newStatus,
      userId,
      "Accepted for review"
    );

    return getChangeOrderById(changeOrderId, userId) as Promise<ChangeOrderWithDetails>;
  });
}

/**
 * Review change order (approve or reject)
 */
export async function reviewChangeOrder(
  input: ReviewChangeOrderInput,
  userId: string
): Promise<ChangeOrderWithDetails> {
  const [existing] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, input.changeOrderId))
    .limit(1);

  if (!existing) {
    throw new Error("Change order not found");
  }

  if (existing.status !== "in_review" && existing.status !== "submitted") {
    throw new Error("Can only review change orders in submitted or in_review status");
  }

  // Check if user is an approver
  const [approver] = await db
    .select()
    .from(changeOrderApprovers)
    .where(
      and(
        eq(changeOrderApprovers.changeOrderId, input.changeOrderId),
        eq(changeOrderApprovers.approverId, userId)
      )
    )
    .limit(1);

  if (!approver) {
    throw new Error("You are not an approver for this change order");
  }

  return db.transaction(async (tx) => {
    // Update approver status
    await tx
      .update(changeOrderApprovers)
      .set({
        status: input.status,
        comment: input.comment || null,
        reviewedAt: new Date(),
      })
      .where(eq(changeOrderApprovers.id, approver.id));

    // Get all approvers to determine new change order status
    const allApprovers = await tx
      .select()
      .from(changeOrderApprovers)
      .where(eq(changeOrderApprovers.changeOrderId, input.changeOrderId));

    const approved = allApprovers.filter((a) => a.status === "approved").length;
    const rejected = allApprovers.filter((a) => a.status === "rejected").length;
    const total = allApprovers.length;

    let newStatus: ChangeOrderStatus;
    let auditComment: string;

    if (rejected > 0) {
      // Any rejection -> rejected
      newStatus = "rejected";
      auditComment = `Rejected by ${input.comment || "approver"}`;
    } else if (approved === total) {
      // All approved -> approved
      newStatus = "approved";
      auditComment = "Approved by all required approvers";
    } else {
      // Still in review
      newStatus = existing.status;
      auditComment = `Partial approval (${approved}/${total})`;
    }

    // Update change order status if it changed
    if (newStatus !== existing.status) {
      await tx
        .update(changeOrders)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(changeOrders.id, input.changeOrderId));

      // Audit the change
      await auditStatusChange(
        input.changeOrderId,
        existing.status,
        newStatus,
        userId,
        auditComment,
        input.comment ? { approverId: userId, approverComment: input.comment } : undefined
      );

      // Emit status changed event
      publishChangeOrderStatusChanged({
        changeOrderId: input.changeOrderId,
        fromStatus: existing.status,
        toStatus: newStatus,
        changedBy: userId,
        comment: auditComment,
      });

      // Emit approved or rejected event
      if (newStatus === "approved") {
        publishChangeOrderApproved({
          changeOrderId: existing.id,
          type: existing.type,
          number: existing.number,
          title: existing.title,
          projectId: existing.projectId,
          approverId: userId,
          approverComment: input.comment,
          approvedAt: new Date(),
        });
      } else if (newStatus === "rejected") {
        publishChangeOrderRejected({
          changeOrderId: existing.id,
          type: existing.type,
          number: existing.number,
          title: existing.title,
          projectId: existing.projectId,
          rejecterId: userId,
          rejectionReason: input.comment,
          rejectedAt: new Date(),
        });
      }
    }

    return getChangeOrderById(input.changeOrderId, userId) as Promise<ChangeOrderWithDetails>;
  });
}

/**
 * Implement change order (move to implemented status)
 */
export async function implementChangeOrder(
  input: ImplementChangeOrderInput,
  userId: string
): Promise<ChangeOrderWithDetails> {
  const [existing] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, input.changeOrderId))
    .limit(1);

  if (!existing) {
    throw new Error("Change order not found");
  }

  const newStatus: ChangeOrderStatus = "implemented";
  if (!isValidStatusTransition(existing.status, newStatus)) {
    throw new Error(`Cannot implement change order from ${existing.status} status`);
  }

  return db.transaction(async (tx) => {
    await tx
      .update(changeOrders)
      .set({
        status: newStatus,
        implementedAt: new Date(),
        implementedRevisionId: input.revisionId || null,
        updatedAt: new Date(),
      })
      .where(eq(changeOrders.id, input.changeOrderId));

    await auditStatusChange(
      input.changeOrderId,
      existing.status,
      newStatus,
      userId,
      "Change implemented"
    );

    // Emit status changed event
    publishChangeOrderStatusChanged({
      changeOrderId: input.changeOrderId,
      fromStatus: existing.status,
      toStatus: newStatus,
      changedBy: userId,
      comment: "Change implemented",
    });

    // Emit implemented event
    publishChangeOrderImplemented({
      changeOrderId: existing.id,
      type: existing.type,
      number: existing.number,
      title: existing.title,
      projectId: existing.projectId,
      implementedBy: userId,
      implementedRevisionId: input.revisionId,
      implementedAt: new Date(),
    });

    return getChangeOrderById(input.changeOrderId, userId) as Promise<ChangeOrderWithDetails>;
  });
}

/**
 * List change orders with filters
 */
export async function listChangeOrders(
  projectId: string,
  filters: ChangeOrderListFilters = {}
): Promise<{ items: ChangeOrderWithDetails[]; total: number }> {
  const conditions = [eq(changeOrders.projectId, projectId)];

  if (filters.status) {
    conditions.push(eq(changeOrders.status, filters.status));
  }

  if (filters.type) {
    conditions.push(eq(changeOrders.type, filters.type));
  }

  if (filters.requesterId) {
    conditions.push(eq(changeOrders.requesterId, filters.requesterId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(changeOrders)
    .where(whereClause);

  // Get change orders
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  const items = await db
    .select()
    .from(changeOrders)
    .where(whereClause)
    .orderBy(desc(changeOrders.createdAt))
    .limit(limit)
    .offset(offset);

  // Batch fetch details for all items (efficient approach)
  const itemIds = items.map(item => item.id);

  // Fetch requesters in batch
  const requesterIds = items.map(item => item.requesterId);
  const requesters = requesterIds.length > 0
    ? await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, requesterIds))
    : [];
  const requesterMap = new Map(requesters.map(r => [r.id, r.name]));

  // Fetch projects in batch
  const projectIds = items.map(item => item.projectId);
  const projectData = projectIds.length > 0
    ? await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(inArray(projects.id, projectIds))
    : [];
  const projectMap = new Map(projectData.map(p => [p.id, p.name]));

  // Fetch approvers in batch
  const approvers = itemIds.length > 0
    ? await db
        .select()
        .from(changeOrderApprovers)
        .where(inArray(changeOrderApprovers.changeOrderId, itemIds))
    : [];
  const approversMap = new Map<string, ChangeOrderApprover[]>();
  for (const approver of approvers) {
    const existing = approversMap.get(approver.changeOrderId) || [];
    existing.push(approver);
    approversMap.set(approver.changeOrderId, existing);
  }

  // Build items with details
  const itemsWithDetails: ChangeOrderWithDetails[] = items.map(item => {
    const approversList = approversMap.get(item.id) || [];
    const approved = approversList.filter(a => a.status === "approved").length;
    const rejected = approversList.filter(a => a.status === "rejected").length;
    const pending = approversList.filter(a => a.status === "pending").length;

    return {
      ...item,
      requesterName: requesterMap.get(item.requesterId),
      projectName: projectMap.get(item.projectId),
      approvers: approversList,
      approvalProgress: {
        total: approversList.length,
        approved,
        rejected,
        pending,
      },
    };
  });

  return {
    items: itemsWithDetails,
    total: Number(count),
  };
}

/**
 * Enriched audit trail entry type for timeline component
 */
export interface EnrichedAuditTrail extends Omit<AuditTrail, 'metadata'> {
  userName?: string;
  userEmail?: string | null;
  eventType: string;
  details?: JsonValue;
  timestamp: Date;
  metadata?: unknown;
}

/**
 * Get audit trail for change order with user information
 * Returns enriched audit trail entries including user name and email
 */
export async function getAuditTrail(
  changeOrderId: string
): Promise<EnrichedAuditTrail[]> {
  const auditTrailData = await db
    .select({
      id: changeOrderAuditTrail.id,
      changeOrderId: changeOrderAuditTrail.changeOrderId,
      fromStatus: changeOrderAuditTrail.fromStatus,
      toStatus: changeOrderAuditTrail.toStatus,
      changedBy: changeOrderAuditTrail.changedBy,
      comment: changeOrderAuditTrail.comment,
      metadata: changeOrderAuditTrail.metadata,
      createdAt: changeOrderAuditTrail.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(changeOrderAuditTrail)
    .leftJoin(users, eq(changeOrderAuditTrail.changedBy, users.id))
    .where(eq(changeOrderAuditTrail.changeOrderId, changeOrderId))
    .orderBy(desc(changeOrderAuditTrail.createdAt));

  // Enrich with derived fields for timeline component
  return auditTrailData.map((entry) => ({
    ...entry,
    eventType: entry.toStatus,
    details: entry.metadata as JsonValue,
    timestamp: entry.createdAt,
  })) as EnrichedAuditTrail[];
}

/**
 * Perform impact analysis for change order
 */
export async function performImpactAnalysis(
  changeOrderId: string
): Promise<ImpactAnalysisResult> {
  // Get affected parts
  const affectedPartsResult = await db
    .select()
    .from(changeOrderAffectedParts)
    .where(eq(changeOrderAffectedParts.changeOrderId, changeOrderId));

  // TODO: Get part details from parts table
  const affectedParts = affectedPartsResult.map((ap) => ({
    partId: ap.partId,
    impactDescription: ap.impactDescription || undefined,
  }));

  // Find related change orders for the same affected parts
  const relatedChangeOrdersResult = await db
    .select()
    .from(changeOrders)
    .where(inArray(changeOrders.id, [changeOrderId])) // TODO: Find actual related change orders
    .limit(5);

  const relatedChangeOrders = relatedChangeOrdersResult.map((co) => ({
    id: co.id,
    number: `${co.type}-${co.number}`,
    title: co.title,
    status: co.status as ChangeOrderStatus,
  }));

  return {
    affectedParts,
    whereUsedCount: affectedParts.length,
    relatedChangeOrders,
  };
}

/**
 * Get change order statistics for project
 */
export async function getProjectStatistics(
  projectId: string
): Promise<{
  total: number;
  byStatus: Record<ChangeOrderStatus, number>;
  byType: Record<ChangeOrderType, number>;
}> {
  const allChangeOrders = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.projectId, projectId));

  const byStatus: Record<ChangeOrderStatus, number> = {
    draft: 0,
    submitted: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
    implemented: 0,
  };

  const byType: Record<ChangeOrderType, number> = {
    ECR: 0,
    ECN: 0,
  };

  for (const co of allChangeOrders) {
    byStatus[co.status]++;
    byType[co.type]++;
  }

  return {
    total: allChangeOrders.length,
    byStatus,
    byType,
  };
}

/**
 * Export change orders as CSV
 */
export async function exportChangeOrdersAsCsv(
  projectId: string,
  filters: Omit<ChangeOrderListFilters, "limit" | "offset"> = {}
): Promise<{
  filename: string;
  content: string;
}> {
  const { items } = await listChangeOrders(projectId, { ...filters, limit: 1000 });

  // Generate CSV
  const headers = ["ID", "Type", "Number", "Title", "Status", "Requester", "Created At", "Updated At"];
  const rows = items.map((item) => [
    item.id,
    item.type,
    item.number,
    `"${item.title.replace(/"/g, '""')}"`, // Escape quotes
    item.status,
    item.requesterName || "Unknown",
    new Date(item.createdAt).toLocaleString("ko-KR"),
    new Date(item.updatedAt).toLocaleString("ko-KR"),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return {
    filename: `change-orders-${new Date().toISOString().split("T")[0]}.csv`,
    content: csv,
  };
}

/**
 * Delete a change order (only allowed in draft status)
 */
export async function deleteChangeOrder(
  changeOrderId: string,
  userId: string
): Promise<ChangeOrderWithDetails> {
  const [existing] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, changeOrderId))
    .limit(1);

  if (!existing) {
    throw new Error("Change order not found");
  }

  if (existing.status !== "draft") {
    throw new Error("Only draft change orders can be deleted");
  }

  if (existing.requesterId !== userId) {
    throw new Error("Only the requester can delete the change order");
  }

  // Get the change order details before deletion for return
  const changeOrderDetails = await getChangeOrderById(changeOrderId, userId);

  await db.transaction(async (tx) => {
    // Delete related records first (foreign key constraints)
    await tx
      .delete(changeOrderAffectedParts)
      .where(eq(changeOrderAffectedParts.changeOrderId, changeOrderId));

    await tx
      .delete(changeOrderAuditTrail)
      .where(eq(changeOrderAuditTrail.changeOrderId, changeOrderId));

    await tx
      .delete(changeOrderApprovers)
      .where(eq(changeOrderApprovers.changeOrderId, changeOrderId));

    // Delete the change order
    await tx
      .delete(changeOrders)
      .where(eq(changeOrders.id, changeOrderId));
  });

  return changeOrderDetails as ChangeOrderWithDetails;
}

/**
 * Add an approver to a change order
 */
export async function addApprover(
  changeOrderId: string,
  approverId: string,
  userId: string
): Promise<ChangeOrderWithDetails> {
  const [existing] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, changeOrderId))
    .limit(1);

  if (!existing) {
    throw new Error("Change order not found");
  }

  if (existing.status !== "draft") {
    throw new Error("Can only add approvers to draft change orders");
  }

  if (existing.requesterId !== userId) {
    throw new Error("Only the requester can add approvers");
  }

  // Verify approver exists
  const [approver] = await db
    .select()
    .from(users)
    .where(eq(users.id, approverId))
    .limit(1);

  if (!approver) {
    throw new Error("Approver not found");
  }

  // Check if approver already exists
  const [existingApprover] = await db
    .select()
    .from(changeOrderApprovers)
    .where(
      and(
        eq(changeOrderApprovers.changeOrderId, changeOrderId),
        eq(changeOrderApprovers.approverId, approverId)
      )
    )
    .limit(1);

  if (existingApprover) {
    throw new Error("Approver already exists for this change order");
  }

  // Add the approver
  await db.insert(changeOrderApprovers).values({
    changeOrderId,
    approverId,
    status: "pending",
  });

  return getChangeOrderById(changeOrderId, userId) as Promise<ChangeOrderWithDetails>;
}

/**
 * Remove an approver from a change order
 */
export async function removeApprover(
  changeOrderId: string,
  approverId: string,
  userId: string
): Promise<ChangeOrderWithDetails> {
  const [existing] = await db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.id, changeOrderId))
    .limit(1);

  if (!existing) {
    throw new Error("Change order not found");
  }

  if (existing.status !== "draft") {
    throw new Error("Can only remove approvers from draft change orders");
  }

  if (existing.requesterId !== userId) {
    throw new Error("Only the requester can remove approvers");
  }

  // Check if approver exists
  const [approverRecord] = await db
    .select()
    .from(changeOrderApprovers)
    .where(
      and(
        eq(changeOrderApprovers.changeOrderId, changeOrderId),
        eq(changeOrderApprovers.approverId, approverId)
      )
    )
    .limit(1);

  if (!approverRecord) {
    throw new Error("Approver not found for this change order");
  }

  // Can only remove pending approvers
  if (approverRecord.status !== "pending") {
    throw new Error("Can only remove pending approvers");
  }

  // Remove the approver
  await db
    .delete(changeOrderApprovers)
    .where(eq(changeOrderApprovers.id, approverRecord.id));

  return getChangeOrderById(changeOrderId, userId) as Promise<ChangeOrderWithDetails>;
}
