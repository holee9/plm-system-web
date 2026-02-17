/**
 * PLM Service - Business logic for parts, revisions, and BOM management
 */
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import {
  parts,
  revisions,
  bomItems,
  type Part,
  type NewPart,
  type Revision,
  type NewRevision,
  type BomItem,
  type NewBomItem,
} from "~/server/db";
import {
  getNextRevisionCode,
  sortRevisionCodes,
} from "./revision-utils";
import {
  detectCycle,
  buildBomTree,
  flattenBomTree,
  calculateTotalQuantity,
  findWhereUsed,
  validateBomTree,
  type BomTreeNode,
  type FlatBomItem,
} from "./bom-utils";
import {
  PlmValidationError,
  PlmNotFoundError,
  PlmAccessError,
  BomCycleError,
  type PartWithDetails,
  type CreatePartInput,
  type UpdatePartInput,
  type PartSearchParams,
  type BomItemWithDetails,
  type AddBomItemInput,
  type UpdateBomItemInput,
  type RemoveBomItemInput,
  type BomTreeResponse,
  type WhereUsedResponse,
  type RevisionHistoryResponse,
  type RevisionWithChanges,
} from "./types";

// ============================================================================
// Validation Constants
// ============================================================================

const PART_NUMBER_PATTERN = /^[A-Z0-9-]{1,50}$/;
const PART_NAME_MIN_LENGTH = 2;
const PART_NAME_MAX_LENGTH = 255;
const QUANTITY_PATTERN = /^\d+(\.\d{1,2})?$/;
const MAX_BOM_DEPTH = 20;

// ============================================================================
// Part Management
// ============================================================================

/**
 * Validate part number format
 */
export function validatePartNumber(partNumber: string): void {
  if (!partNumber || partNumber.trim().length === 0) {
    throw new PlmValidationError("partNumber", "Part number is required");
  }

  if (!PART_NUMBER_PATTERN.test(partNumber)) {
    throw new PlmValidationError(
      "partNumber",
      "Part number must be 1-50 characters (alphanumeric, hyphen allowed)"
    );
  }
}

/**
 * Validate part name
 */
export function validatePartName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new PlmValidationError("name", "Part name is required");
  }

  if (name.length < PART_NAME_MIN_LENGTH) {
    throw new PlmValidationError(
      "name",
      `Part name must be at least ${PART_NAME_MIN_LENGTH} characters`
    );
  }

  if (name.length > PART_NAME_MAX_LENGTH) {
    throw new PlmValidationError(
      "name",
      `Part name must not exceed ${PART_NAME_MAX_LENGTH} characters`
    );
  }
}

/**
 * Check if part number already exists in project
 */
export async function isPartNumberDuplicate(
  projectId: string,
  partNumber: string
): Promise<boolean> {
  const existing = await db
    .select({ id: parts.id })
    .from(parts)
    .where(
      and(
        eq(parts.projectId, projectId),
        eq(parts.partNumber, partNumber)
      )
    )
    .limit(1);

  return existing.length > 0;
}

/**
 * Create a new part with initial revision (Rev A)
 */
export async function createPart(
  input: CreatePartInput,
  userId: string
): Promise<PartWithDetails> {
  // Validate inputs
  validatePartNumber(input.partNumber);
  validatePartName(input.name);

  // Check for duplicate part number in project
  if (await isPartNumberDuplicate(input.projectId, input.partNumber)) {
    throw new PlmValidationError(
      "partNumber",
      `Part number "${input.partNumber}" already exists in this project`
    );
  }

  // Start transaction
  return db.transaction(async (tx) => {
    // Create part
    const newPart: NewPart = {
      projectId: input.projectId,
      partNumber: input.partNumber,
      name: input.name,
      description: input.description || null,
      category: input.category || null,
      status: input.status || "draft",
      createdBy: userId,
    };

    const [created] = await tx.insert(parts).values(newPart).returning();

    // Create initial revision (Rev A)
    const initialRevision: NewRevision = {
      partId: created.id,
      revisionCode: "A",
      description: "Initial revision",
      changes: null,
      createdBy: userId,
    };

    const [revision] = await tx.insert(revisions).values(initialRevision).returning();

    // Update part with current revision
    await tx
      .update(parts)
      .set({ currentRevisionId: revision.id })
      .where(eq(parts.id, created.id));

    return {
      ...created,
      currentRevision: revision,
      revisionCount: 1,
      bomItemCount: 0,
      whereUsedCount: 0,
    };
  });
}

/**
 * Get part by ID with details
 */
export async function getPartById(
  partId: string,
  userId: string
): Promise<PartWithDetails | null> {
  const [part] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, partId))
    .limit(1);

  if (!part) {
    return null;
  }

  // Get current revision
  let currentRevision: Revision | undefined;
  if (part.currentRevisionId) {
    const [revision] = await db
      .select()
      .from(revisions)
      .where(eq(revisions.id, part.currentRevisionId))
      .limit(1);

    currentRevision = revision;
  }

  // Count revisions
  const [revisionCount] = await db
    .select({ count: count() })
    .from(revisions)
    .where(eq(revisions.partId, partId));

  // Count BOM items (children)
  const [bomItemCount] = await db
    .select({ count: count() })
    .from(bomItems)
    .where(eq(bomItems.parentPartId, partId));

  // Count where-used (parents)
  const [whereUsedCount] = await db
    .select({ count: count() })
    .from(bomItems)
    .where(eq(bomItems.childPartId, partId));

  return {
    ...part,
    currentRevision,
    revisionCount: Number(revisionCount.count),
    bomItemCount: Number(bomItemCount.count),
    whereUsedCount: Number(whereUsedCount.count),
  };
}

/**
 * List parts with search and filters
 */
export async function listParts(
  params: PartSearchParams
): Promise<{ parts: PartWithDetails[]; total: number }> {
  const {
    projectId,
    query,
    category,
    status,
    limit = 20,
    offset = 0,
  } = params;

  // Build conditions
  const conditions = [eq(parts.projectId, projectId)];

  if (status) {
    conditions.push(eq(parts.status, status));
  }

  if (category) {
    conditions.push(eq(parts.category, category));
  }

  // Text search (simple implementation)
  let searchCondition = null;
  if (query && query.trim().length > 0) {
    const searchTerm = `%${query.trim()}%`;
    searchCondition = sql`(
      ${parts.partNumber} ILIKE ${searchTerm} OR
      ${parts.name} ILIKE ${searchTerm} OR
      COALESCE(${parts.description}, '') ILIKE ${searchTerm}
    )`;
  }

  // Get total count
  const countConditions = searchCondition
    ? [...conditions, searchCondition]
    : conditions;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(parts)
    .where(and(...countConditions));

  // Get parts with pagination
  const searchConditions = searchCondition
    ? [...conditions, searchCondition]
    : conditions;

  const partsList = await db
    .select()
    .from(parts)
    .where(and(...searchConditions))
    .orderBy(desc(parts.updatedAt))
    .limit(limit)
    .offset(offset);

  // TODO: Add revision/BOM counts efficiently for list view
  // For now, return basic parts
  return {
    parts: partsList as PartWithDetails[],
    total: Number(count),
  };
}

/**
 * Update part and create new revision
 */
export async function updatePart(
  input: UpdatePartInput,
  userId: string
): Promise<PartWithDetails> {
  // Get existing part
  const existing = await db
    .select()
    .from(parts)
    .where(eq(parts.id, input.partId))
    .limit(1);

  if (existing.length === 0) {
    throw new PlmNotFoundError("Part", input.partId);
  }

  const part = existing[0];

  // Validate if name is being updated
  if (input.name !== undefined) {
    validatePartName(input.name);
  }

  // Build changes record
  const changes: Record<string, { oldValue: any; newValue: any }> = {};

  if (input.name !== undefined && input.name !== part.name) {
    changes.name = { oldValue: part.name, newValue: input.name };
  }

  if (input.description !== undefined && input.description !== part.description) {
    changes.description = { oldValue: part.description, newValue: input.description };
  }

  if (input.category !== undefined && input.category !== part.category) {
    changes.category = { oldValue: part.category, newValue: input.category };
  }

  if (input.status !== undefined && input.status !== part.status) {
    changes.status = { oldValue: part.status, newValue: input.status };
  }

  // If no changes, return existing
  if (Object.keys(changes).length === 0) {
    return (await getPartById(input.partId, userId))!;
  }

  // Start transaction
  return db.transaction(async (tx) => {
    // Get latest revision code
    const [latestRevision] = await tx
      .select({ revisionCode: revisions.revisionCode })
      .from(revisions)
      .where(eq(revisions.partId, input.partId))
      .orderBy(desc(revisions.createdAt))
      .limit(1);

    const nextRevisionCode = getNextRevisionCode(
      latestRevision?.revisionCode || null
    );

    // Create new revision
    const newRevision: NewRevision = {
      partId: input.partId,
      revisionCode: nextRevisionCode,
      description: input.changeDescription || `Revision ${nextRevisionCode}`,
      changes: changes as any,
      createdBy: userId,
    };

    const [revision] = await tx.insert(revisions).values(newRevision).returning();

    // Update part
    const updateData: any = {
      updatedAt: sql`now()`,
      currentRevisionId: revision.id,
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.status !== undefined) updateData.status = input.status;

    const [updated] = await tx
      .update(parts)
      .set(updateData)
      .where(eq(parts.id, input.partId))
      .returning();

    return (await getPartById(input.partId, userId))!;
  });
}

/**
 * Search parts across all accessible projects
 */
export async function searchParts(
  userId: string,
  query: string,
  limit: number = 10
): Promise<Part[]> {
  const searchTerm = `%${query.trim()}%`;

  const results = await db
    .select()
    .from(parts)
    .where(
      sql`(
        ${parts.partNumber} ILIKE ${searchTerm} OR
        ${parts.name} ILIKE ${searchTerm}
      )`
    )
    .limit(limit);

  return results;
}

// ============================================================================
// BOM Management
// ============================================================================

/**
 * Add item to BOM with cycle detection
 */
export async function addBomItem(input: AddBomItemInput): Promise<BomItem> {
  // Validate parts exist
  const [parent] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, input.parentPartId))
    .limit(1);

  if (!parent) {
    throw new PlmNotFoundError("Parent part", input.parentPartId);
  }

  const [child] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, input.childPartId))
    .limit(1);

  if (!child) {
    throw new PlmNotFoundError("Child part", input.childPartId);
  }

  // Validate quantity
  if (!QUANTITY_PATTERN.test(input.quantity)) {
    throw new PlmValidationError(
      "quantity",
      "Quantity must be a positive number (e.g., 1, 2.5)"
    );
  }

  // Get existing BOM edges for cycle detection
  const existingEdges = await db
    .select()
    .from(bomItems);

  // Check for cycle
  const hasCycle = detectCycle(
    existingEdges.map(e => ({
      parentId: e.parentPartId,
      childId: e.childPartId,
      quantity: e.quantity,
      unit: e.unit,
      position: e.position,
      notes: e.notes || undefined,
    })),
    input.parentPartId,
    input.childPartId
  );

  if (hasCycle) {
    throw new BomCycleError(
      `Cannot add ${child.partNumber} as child of ${parent.partNumber}: would create a circular reference`
    );
  }

  // Get next position
  const [maxPosition] = await db
    .select({ position: sql<number>`MAX(position)` })
    .from(bomItems)
    .where(eq(bomItems.parentPartId, input.parentPartId));

  const nextPosition = (maxPosition?.position ?? 0) + 1;

  // Create BOM item
  const newBomItem: NewBomItem = {
    parentPartId: input.parentPartId,
    childPartId: input.childPartId,
    quantity: input.quantity,
    unit: input.unit || "EA",
    position: input.position ?? nextPosition,
    notes: input.notes || null,
  };

  const [created] = await db.insert(bomItems).values(newBomItem).returning();

  return created;
}

/**
 * Remove item from BOM
 */
export async function removeBomItem(input: RemoveBomItemInput): Promise<void> {
  const [existing] = await db
    .select()
    .from(bomItems)
    .where(eq(bomItems.id, input.bomItemId))
    .limit(1);

  if (!existing) {
    throw new PlmNotFoundError("BOM item", input.bomItemId);
  }

  await db.delete(bomItems).where(eq(bomItems.id, input.bomItemId));
}

/**
 * Update BOM item
 */
export async function updateBomItem(input: UpdateBomItemInput): Promise<BomItem> {
  const [existing] = await db
    .select()
    .from(bomItems)
    .where(eq(bomItems.id, input.bomItemId))
    .limit(1);

  if (!existing) {
    throw new PlmNotFoundError("BOM item", input.bomItemId);
  }

  // Validate quantity if provided
  if (input.quantity !== undefined && !QUANTITY_PATTERN.test(input.quantity)) {
    throw new PlmValidationError(
      "quantity",
      "Quantity must be a positive number (e.g., 1, 2.5)"
    );
  }

  // Build update data
  const updateData: Partial<NewBomItem> = {};

  if (input.quantity !== undefined) updateData.quantity = input.quantity;
  if (input.unit !== undefined) updateData.unit = input.unit;
  if (input.position !== undefined) updateData.position = input.position;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const [updated] = await db
    .update(bomItems)
    .set(updateData)
    .where(eq(bomItems.id, input.bomItemId))
    .returning();

  return updated;
}

/**
 * Get BOM tree for a part
 */
export async function getBomTree(partId: string): Promise<BomTreeResponse> {
  // Get root part
  const [rootPart] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, partId))
    .limit(1);

  if (!rootPart) {
    throw new PlmNotFoundError("Part", partId);
  }

  // Get all parts in the same project for BOM
  const allParts = await db
    .select()
    .from(parts)
    .where(eq(parts.projectId, rootPart.projectId));

  const partsMap = new Map(
    allParts.map(p => [p.id, p])
  ) as Map<string, { id: string; name: string; partNumber: string; description?: string; category?: string; status?: string }>;

  // Get BOM relationships
  const bomRelations = await db
    .select()
    .from(bomItems);

  const edges = bomRelations.map(r => ({
    parentId: r.parentPartId,
    childId: r.childPartId,
    quantity: r.quantity,
    unit: r.unit,
    position: r.position,
    notes: r.notes || undefined,
  }));

  // Validate tree
  const validation = validateBomTree(partId, partsMap, edges, MAX_BOM_DEPTH);
  if (!validation.valid) {
    throw new Error(`Invalid BOM tree: ${validation.errors.join(", ")}`);
  }

  // Build tree
  const tree = buildBomTree(partId, partsMap, edges);

  // Flatten for table
  const flatList = flattenBomTree(tree);

  // Calculate stats
  const maxLevel = Math.max(...flatList.map(item => item.level));

  return {
    rootPart,
    tree,
    flatList,
    maxLevel,
    totalParts: flatList.length,
  };
}

/**
 * Get where-used for a part
 */
export async function getWhereUsed(partId: string): Promise<WhereUsedResponse> {
  // Get part
  const [part] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, partId))
    .limit(1);

  if (!part) {
    throw new PlmNotFoundError("Part", partId);
  }

  // Get all BOM items where this part is a child
  const parents = await db
    .select({
      parentPartId: bomItems.parentPartId,
      quantity: bomItems.quantity,
      unit: bomItems.unit,
    })
    .from(bomItems)
    .where(eq(bomItems.childPartId, partId));

  // Get parent part details
  const parentIds = parents.map(p => p.parentPartId);
  const parentParts = parentIds.length > 0
    ? await db
      .select()
      .from(parts)
      .where(inArray(parts.id, parentIds))
    : [];

  const parentsMap: Map<string, typeof parentParts[number]> = new Map(
    parentParts.map(p => [p.id, p])
  );

  // Build response with paths
  const parentList = parents.map(p => {
    const parentPart = parentsMap.get(p.parentPartId);
    if (!parentPart) return null;

    return {
      partId: parentPart.id,
      partNumber: parentPart.partNumber,
      name: parentPart.name,
      quantity: p.quantity,
      unit: p.unit,
      path: `${parentPart.partNumber} > ${part.partNumber}`,
    };
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  return {
    partId: part.id,
    partNumber: part.partNumber,
    name: part.name,
    parents: parentList,
  };
}

/**
 * Get revision history for a part
 */
export async function getRevisionHistory(partId: string): Promise<RevisionHistoryResponse> {
  // Get part
  const [part] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, partId))
    .limit(1);

  if (!part) {
    throw new PlmNotFoundError("Part", partId);
  }

  // Get revisions sorted by code
  const revisionsList = await db
    .select()
    .from(revisions)
    .where(eq(revisions.partId, partId))
    .orderBy(revisions.createdAt);

  // Sort by revision code
  const sortedRevisions = sortRevisionCodes(
    revisionsList.map(r => r.revisionCode)
  ).map(code =>
    revisionsList.find(r => r.revisionCode === code)!
  );

  return {
    partId: part.id,
    partNumber: part.partNumber,
    name: part.name,
    revisions: sortedRevisions as RevisionWithChanges[],
    total: sortedRevisions.length,
  };
}
