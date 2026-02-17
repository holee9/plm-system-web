/**
 * Manufacturer and Supplier Service
 * Business logic for managing part manufacturers and suppliers
 */
import { eq, and, desc, sql, count, inArray, exists, not } from "drizzle-orm";
import { db } from "~/server/db";
import {
  parts,
  bomItems,
  manufacturers,
  suppliers,
  partsManufacturers,
  partsSuppliers,
  type Manufacturer,
  type NewManufacturer,
  type Supplier,
  type NewSupplier,
} from "~/server/db";
import {
  PlmValidationError,
  PlmNotFoundError,
  type ManufacturerWithDetails,
  type SupplierWithDetails,
  type CreateManufacturerInput,
  type UpdateManufacturerInput,
  type CreateSupplierInput,
  type UpdateSupplierInput,
  type ManufacturerSearchParams,
  type SupplierSearchParams,
} from "./types";

// ============================================================================
// Validation Constants
// ============================================================================

const CODE_PATTERN = /^[A-Z0-9-]{1,20}$/;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 255;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{0,50}$/;
const URL_PATTERN = /^https?:\/\/.+/i;

// ============================================================================
// Manufacturer Management
// ============================================================================

/**
 * Validate manufacturer code format
 */
export function validateManufacturerCode(code: string): void {
  if (!code || code.trim().length === 0) {
    throw new PlmValidationError("code", "Manufacturer code is required");
  }

  if (!CODE_PATTERN.test(code)) {
    throw new PlmValidationError(
      "code",
      "Manufacturer code must be 1-20 characters (alphanumeric, hyphen allowed)"
    );
  }
}

/**
 * Validate manufacturer name
 */
export function validateManufacturerName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new PlmValidationError("name", "Manufacturer name is required");
  }

  if (name.length < NAME_MIN_LENGTH) {
    throw new PlmValidationError(
      "name",
      `Manufacturer name must be at least ${NAME_MIN_LENGTH} characters`
    );
  }

  if (name.length > NAME_MAX_LENGTH) {
    throw new PlmValidationError(
      "name",
      `Manufacturer name must not exceed ${NAME_MAX_LENGTH} characters`
    );
  }
}

/**
 * Validate website URL
 */
export function validateWebsite(url?: string): void {
  if (url && url.trim().length > 0 && !URL_PATTERN.test(url)) {
    throw new PlmValidationError(
      "website",
      "Website must be a valid URL (starting with http:// or https://)"
    );
  }
}

/**
 * Check if manufacturer code already exists
 */
export async function isManufacturerCodeDuplicate(code: string): Promise<boolean> {
  const existing = await db
    .select({ id: manufacturers.id })
    .from(manufacturers)
    .where(eq(manufacturers.code, code))
    .limit(1);

  return existing.length > 0;
}

/**
 * Create a new manufacturer
 */
export async function createManufacturer(
  input: CreateManufacturerInput,
  userId: string
): Promise<ManufacturerWithDetails> {
  // Validate inputs
  validateManufacturerCode(input.code);
  validateManufacturerName(input.name);
  validateWebsite(input.website);

  // Check for duplicate code
  if (await isManufacturerCodeDuplicate(input.code)) {
    throw new PlmValidationError(
      "code",
      `Manufacturer code "${input.code}" already exists`
    );
  }

  // Create manufacturer
  const newManufacturer: NewManufacturer = {
    code: input.code,
    name: input.name,
    website: input.website || null,
    description: input.description || null,
    createdBy: userId,
  };

  const [created] = await db.insert(manufacturers).values(newManufacturer).returning();

  return {
    ...created,
    partsCount: 0,
  };
}

/**
 * Get manufacturer by ID with details
 */
export async function getManufacturerById(
  manufacturerId: string
): Promise<ManufacturerWithDetails | null> {
  const [manufacturer] = await db
    .select()
    .from(manufacturers)
    .where(eq(manufacturers.id, manufacturerId))
    .limit(1);

  if (!manufacturer) {
    return null;
  }

  // Count associated parts
  const [partsCount] = await db
    .select({ partsCount: count() })
    .from(partsManufacturers)
    .where(eq(partsManufacturers.manufacturerId, manufacturerId));

  return {
    ...manufacturer,
    partsCount: Number(partsCount.partsCount),
  };
}

/**
 * List manufacturers with search and filters
 */
export async function listManufacturers(
  params: ManufacturerSearchParams
): Promise<{ manufacturers: ManufacturerWithDetails[]; total: number }> {
  const { query, limit = 20, offset = 0 } = params;

  // Build conditions
  const conditions: any[] = [];

  // Text search
  let searchCondition = null;
  if (query && query.trim().length > 0) {
    const searchTerm = `%${query.trim()}%`;
    searchCondition = sql`(
      ${manufacturers.code} ILIKE ${searchTerm} OR
      ${manufacturers.name} ILIKE ${searchTerm} OR
      COALESCE(${manufacturers.description}, '') ILIKE ${searchTerm}
    )`;
  }

  // Get total count
  const countConditions = searchCondition
    ? [...conditions, searchCondition]
    : conditions;

  const [{ count: totalCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(manufacturers)
    .where(searchCondition ? searchCondition : undefined);

  // Get manufacturers with pagination
  const manufacturersList = await db
    .select()
    .from(manufacturers)
    .where(searchCondition ? searchCondition : undefined)
    .orderBy(desc(manufacturers.createdAt))
    .limit(limit)
    .offset(offset);

  // Get parts count for each manufacturer
  const manufacturerIds = manufacturersList.map(m => m.id);
  const partsCounts = manufacturerIds.length > 0
    ? await db
        .select({
          manufacturerId: partsManufacturers.manufacturerId,
          partsCount: count(),
        })
        .from(partsManufacturers)
        .where(inArray(partsManufacturers.manufacturerId, manufacturerIds))
        .groupBy(partsManufacturers.manufacturerId)
    : [];

  const countsMap = new Map(
    partsCounts.map(pc => [pc.manufacturerId, Number(pc.partsCount)])
  );

  const manufacturersWithCounts = manufacturersList.map(m => ({
    ...m,
    partsCount: countsMap.get(m.id) || 0,
  }));

  return {
    manufacturers: manufacturersWithCounts,
    total: Number(totalCount),
  };
}

/**
 * Update manufacturer
 */
export async function updateManufacturer(
  input: UpdateManufacturerInput
): Promise<ManufacturerWithDetails> {
  // Get existing manufacturer
  const [existing] = await db
    .select()
    .from(manufacturers)
    .where(eq(manufacturers.id, input.manufacturerId))
    .limit(1);

  if (!existing) {
    throw new PlmNotFoundError("Manufacturer", input.manufacturerId);
  }

  // Validate name if being updated
  if (input.name !== undefined) {
    validateManufacturerName(input.name);
  }

  // Validate code if being updated
  if (input.code !== undefined && input.code !== existing.code) {
    validateManufacturerCode(input.code);
    if (await isManufacturerCodeDuplicate(input.code)) {
      throw new PlmValidationError(
        "code",
        `Manufacturer code "${input.code}" already exists`
      );
    }
  }

  // Validate website if being updated
  if (input.website !== undefined) {
    validateWebsite(input.website);
  }

  // Build update data
  const updateData: Partial<NewManufacturer> = {
    updatedAt: new Date(),
  };

  if (input.code !== undefined) updateData.code = input.code;
  if (input.name !== undefined) updateData.name = input.name;
  if (input.website !== undefined) updateData.website = input.website || null;
  if (input.description !== undefined) updateData.description = input.description || null;

  await db
    .update(manufacturers)
    .set(updateData)
    .where(eq(manufacturers.id, input.manufacturerId));

  return (await getManufacturerById(input.manufacturerId))!;
}

/**
 * Delete manufacturer
 */
export async function deleteManufacturer(manufacturerId: string): Promise<void> {
  // Check if manufacturer exists
  const [existing] = await db
    .select()
    .from(manufacturers)
    .where(eq(manufacturers.id, manufacturerId))
    .limit(1);

  if (!existing) {
    throw new PlmNotFoundError("Manufacturer", manufacturerId);
  }

  // Check if manufacturer has associated parts
  const [partsCount] = await db
    .select({ partsCount: count() })
    .from(partsManufacturers)
    .where(eq(partsManufacturers.manufacturerId, manufacturerId));

  if (Number(partsCount.partsCount) > 0) {
    throw new PlmValidationError(
      "manufacturerId",
      `Cannot delete manufacturer with ${partsCount.partsCount} associated parts. Please unlink all parts first.`
    );
  }

  // Delete manufacturer (cascade will delete junction table entries)
  await db.delete(manufacturers).where(eq(manufacturers.id, manufacturerId));
}

// ============================================================================
// Supplier Management
// ============================================================================

/**
 * Validate supplier code format
 */
export function validateSupplierCode(code: string): void {
  if (!code || code.trim().length === 0) {
    throw new PlmValidationError("code", "Supplier code is required");
  }

  if (!CODE_PATTERN.test(code)) {
    throw new PlmValidationError(
      "code",
      "Supplier code must be 1-20 characters (alphanumeric, hyphen allowed)"
    );
  }
}

/**
 * Validate supplier name
 */
export function validateSupplierName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new PlmValidationError("name", "Supplier name is required");
  }

  if (name.length < NAME_MIN_LENGTH) {
    throw new PlmValidationError(
      "name",
      `Supplier name must be at least ${NAME_MIN_LENGTH} characters`
    );
  }

  if (name.length > NAME_MAX_LENGTH) {
    throw new PlmValidationError(
      "name",
      `Supplier name must not exceed ${NAME_MAX_LENGTH} characters`
    );
  }
}

/**
 * Validate email format
 */
export function validateEmail(email?: string): void {
  if (email && email.trim().length > 0 && !EMAIL_PATTERN.test(email)) {
    throw new PlmValidationError(
      "contactEmail",
      "Contact email must be a valid email address"
    );
  }
}

/**
 * Validate phone format
 */
export function validatePhone(phone?: string): void {
  if (phone && phone.trim().length > 0 && !PHONE_PATTERN.test(phone)) {
    throw new PlmValidationError(
      "contactPhone",
      "Contact phone contains invalid characters"
    );
  }
}

/**
 * Check if supplier code already exists
 */
export async function isSupplierCodeDuplicate(code: string): Promise<boolean> {
  const existing = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .where(eq(suppliers.code, code))
    .limit(1);

  return existing.length > 0;
}

/**
 * Create a new supplier
 */
export async function createSupplier(
  input: CreateSupplierInput,
  userId: string
): Promise<SupplierWithDetails> {
  // Validate inputs
  validateSupplierCode(input.code);
  validateSupplierName(input.name);
  validateEmail(input.contactEmail);
  validatePhone(input.contactPhone);
  validateWebsite(input.website);

  // Check for duplicate code
  if (await isSupplierCodeDuplicate(input.code)) {
    throw new PlmValidationError(
      "code",
      `Supplier code "${input.code}" already exists`
    );
  }

  // Create supplier
  const newSupplier: NewSupplier = {
    code: input.code,
    name: input.name,
    contactEmail: input.contactEmail || null,
    contactPhone: input.contactPhone || null,
    address: input.address || null,
    description: input.description || null,
    createdBy: userId,
  };

  const [created] = await db.insert(suppliers).values(newSupplier).returning();

  return {
    ...created,
    partsCount: 0,
  };
}

/**
 * Get supplier by ID with details
 */
export async function getSupplierById(
  supplierId: string
): Promise<SupplierWithDetails | null> {
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!supplier) {
    return null;
  }

  // Count associated parts
  const [partsCount] = await db
    .select({ partsCount: count() })
    .from(partsSuppliers)
    .where(eq(partsSuppliers.supplierId, supplierId));

  return {
    ...supplier,
    partsCount: Number(partsCount.partsCount),
  };
}

/**
 * List suppliers with search and filters
 */
export async function listSuppliers(
  params: SupplierSearchParams
): Promise<{ suppliers: SupplierWithDetails[]; total: number }> {
  const { query, limit = 20, offset = 0 } = params;

  // Build conditions
  const conditions: any[] = [];

  // Text search
  let searchCondition = null;
  if (query && query.trim().length > 0) {
    const searchTerm = `%${query.trim()}%`;
    searchCondition = sql`(
      ${suppliers.code} ILIKE ${searchTerm} OR
      ${suppliers.name} ILIKE ${searchTerm} OR
      COALESCE(${suppliers.description}, '') ILIKE ${searchTerm}
    )`;
  }

  // Get total count
  const countConditions = searchCondition
    ? [...conditions, searchCondition]
    : conditions;

  const [{ count: totalCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(suppliers)
    .where(searchCondition ? searchCondition : undefined);

  // Get suppliers with pagination
  const suppliersList = await db
    .select()
    .from(suppliers)
    .where(searchCondition ? searchCondition : undefined)
    .orderBy(desc(suppliers.createdAt))
    .limit(limit)
    .offset(offset);

  // Get parts count for each supplier
  const supplierIds = suppliersList.map(s => s.id);
  const partsCounts = supplierIds.length > 0
    ? await db
        .select({
          supplierId: partsSuppliers.supplierId,
          partsCount: count(),
        })
        .from(partsSuppliers)
        .where(inArray(partsSuppliers.supplierId, supplierIds))
        .groupBy(partsSuppliers.supplierId)
    : [];

  const countsMap = new Map(
    partsCounts.map(pc => [pc.supplierId, Number(pc.partsCount)])
  );

  const suppliersWithCounts = suppliersList.map(s => ({
    ...s,
    partsCount: countsMap.get(s.id) || 0,
  }));

  return {
    suppliers: suppliersWithCounts,
    total: Number(totalCount),
  };
}

/**
 * Update supplier
 */
export async function updateSupplier(
  input: UpdateSupplierInput
): Promise<SupplierWithDetails> {
  // Get existing supplier
  const [existing] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, input.supplierId))
    .limit(1);

  if (!existing) {
    throw new PlmNotFoundError("Supplier", input.supplierId);
  }

  // Validate name if being updated
  if (input.name !== undefined) {
    validateSupplierName(input.name);
  }

  // Validate code if being updated
  if (input.code !== undefined && input.code !== existing.code) {
    validateSupplierCode(input.code);
    if (await isSupplierCodeDuplicate(input.code)) {
      throw new PlmValidationError(
        "code",
        `Supplier code "${input.code}" already exists`
      );
    }
  }

  // Validate email if being updated
  if (input.contactEmail !== undefined) {
    validateEmail(input.contactEmail);
  }

  // Validate phone if being updated
  if (input.contactPhone !== undefined) {
    validatePhone(input.contactPhone);
  }

  // Build update data
  const updateData: Partial<NewSupplier> = {
    updatedAt: new Date(),
  };

  if (input.code !== undefined) updateData.code = input.code;
  if (input.name !== undefined) updateData.name = input.name;
  if (input.contactEmail !== undefined) updateData.contactEmail = input.contactEmail || null;
  if (input.contactPhone !== undefined) updateData.contactPhone = input.contactPhone || null;
  if (input.address !== undefined) updateData.address = input.address || null;
  if (input.description !== undefined) updateData.description = input.description || null;

  await db
    .update(suppliers)
    .set(updateData)
    .where(eq(suppliers.id, input.supplierId));

  return (await getSupplierById(input.supplierId))!;
}

/**
 * Delete supplier
 */
export async function deleteSupplier(supplierId: string): Promise<void> {
  // Check if supplier exists
  const [existing] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!existing) {
    throw new PlmNotFoundError("Supplier", supplierId);
  }

  // Check if supplier has associated parts
  const [partsCount] = await db
    .select({ partsCount: count() })
    .from(partsSuppliers)
    .where(eq(partsSuppliers.supplierId, supplierId));

  if (Number(partsCount.partsCount) > 0) {
    throw new PlmValidationError(
      "supplierId",
      `Cannot delete supplier with ${partsCount.partsCount} associated parts. Please unlink all parts first.`
    );
  }

  // Delete supplier (cascade will delete junction table entries)
  await db.delete(suppliers).where(eq(suppliers.id, supplierId));
}

// ============================================================================
// Part-Manufacturer Linking
// ============================================================================

/**
 * Link manufacturer to part
 */
export async function linkManufacturerToPart(
  partId: string,
  manufacturerId: string
): Promise<void> {
  // Verify part exists
  const [part] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, partId))
    .limit(1);

  if (!part) {
    throw new PlmNotFoundError("Part", partId);
  }

  // Verify manufacturer exists
  const [manufacturer] = await db
    .select()
    .from(manufacturers)
    .where(eq(manufacturers.id, manufacturerId))
    .limit(1);

  if (!manufacturer) {
    throw new PlmNotFoundError("Manufacturer", manufacturerId);
  }

  // Check if already linked
  const [existing] = await db
    .select()
    .from(partsManufacturers)
    .where(
      and(
        eq(partsManufacturers.partId, partId),
        eq(partsManufacturers.manufacturerId, manufacturerId)
      )
    )
    .limit(1);

  if (existing) {
    throw new PlmValidationError(
      "link",
      "Manufacturer is already linked to this part"
    );
  }

  // Create link
  await db.insert(partsManufacturers).values({
    partId,
    manufacturerId,
  });
}

/**
 * Unlink manufacturer from part
 */
export async function unlinkManufacturerFromPart(
  partId: string,
  manufacturerId: string
): Promise<void> {
  // Check if link exists
  const [existing] = await db
    .select()
    .from(partsManufacturers)
    .where(
      and(
        eq(partsManufacturers.partId, partId),
        eq(partsManufacturers.manufacturerId, manufacturerId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new PlmNotFoundError(
      "Manufacturer-Part link",
      `${partId}-${manufacturerId}`
    );
  }

  // Delete link
  await db
    .delete(partsManufacturers)
    .where(
      and(
        eq(partsManufacturers.partId, partId),
        eq(partsManufacturers.manufacturerId, manufacturerId)
      )
    );
}

/**
 * Get manufacturers for a part
 */
export async function getManufacturersForPart(
  partId: string
): Promise<Manufacturer[]> {
  const results = await db
    .select({
      id: manufacturers.id,
      code: manufacturers.code,
      name: manufacturers.name,
      website: manufacturers.website,
      description: manufacturers.description,
      createdBy: manufacturers.createdBy,
      createdAt: manufacturers.createdAt,
      updatedAt: manufacturers.updatedAt,
    })
    .from(manufacturers)
    .innerJoin(
      partsManufacturers,
      eq(partsManufacturers.manufacturerId, manufacturers.id)
    )
    .where(eq(partsManufacturers.partId, partId));

  return results as Manufacturer[];
}

/**
 * Get parts for a manufacturer
 */
export async function getPartsForManufacturer(
  manufacturerId: string
): Promise<any[]> {
  const results = await db
    .select({
      id: parts.id,
      projectId: parts.projectId,
      partNumber: parts.partNumber,
      name: parts.name,
      description: parts.description,
      category: parts.category,
      status: parts.status,
      currentRevisionId: parts.currentRevisionId,
      createdBy: parts.createdBy,
      createdAt: parts.createdAt,
      updatedAt: parts.updatedAt,
    })
    .from(parts)
    .innerJoin(
      partsManufacturers,
      eq(partsManufacturers.partId, parts.id)
    )
    .where(eq(partsManufacturers.manufacturerId, manufacturerId));

  return results;
}

// ============================================================================
// Part-Supplier Linking
// ============================================================================

/**
 * Link supplier to part
 */
export async function linkSupplierToPart(
  partId: string,
  supplierId: string
): Promise<void> {
  // Verify part exists
  const [part] = await db
    .select()
    .from(parts)
    .where(eq(parts.id, partId))
    .limit(1);

  if (!part) {
    throw new PlmNotFoundError("Part", partId);
  }

  // Verify supplier exists
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);

  if (!supplier) {
    throw new PlmNotFoundError("Supplier", supplierId);
  }

  // Check if already linked
  const [existing] = await db
    .select()
    .from(partsSuppliers)
    .where(
      and(
        eq(partsSuppliers.partId, partId),
        eq(partsSuppliers.supplierId, supplierId)
      )
    )
    .limit(1);

  if (existing) {
    throw new PlmValidationError(
      "link",
      "Supplier is already linked to this part"
    );
  }

  // Create link
  await db.insert(partsSuppliers).values({
    partId,
    supplierId,
  });
}

/**
 * Unlink supplier from part
 */
export async function unlinkSupplierFromPart(
  partId: string,
  supplierId: string
): Promise<void> {
  // Check if link exists
  const [existing] = await db
    .select()
    .from(partsSuppliers)
    .where(
      and(
        eq(partsSuppliers.partId, partId),
        eq(partsSuppliers.supplierId, supplierId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new PlmNotFoundError(
      "Supplier-Part link",
      `${partId}-${supplierId}`
    );
  }

  // Delete link
  await db
    .delete(partsSuppliers)
    .where(
      and(
        eq(partsSuppliers.partId, partId),
        eq(partsSuppliers.supplierId, supplierId)
      )
    );
}

/**
 * Get suppliers for a part
 */
export async function getSuppliersForPart(partId: string): Promise<Supplier[]> {
  const results = await db
    .select({
      id: suppliers.id,
      code: suppliers.code,
      name: suppliers.name,
      contactEmail: suppliers.contactEmail,
      contactPhone: suppliers.contactPhone,
      address: suppliers.address,
      description: suppliers.description,
      createdBy: suppliers.createdBy,
      createdAt: suppliers.createdAt,
      updatedAt: suppliers.updatedAt,
    })
    .from(suppliers)
    .innerJoin(
      partsSuppliers,
      eq(partsSuppliers.supplierId, suppliers.id)
    )
    .where(eq(partsSuppliers.partId, partId));

  return results as Supplier[];
}

/**
 * Get parts for a supplier
 */
export async function getPartsForSupplier(supplierId: string): Promise<any[]> {
  const results = await db
    .select({
      id: parts.id,
      projectId: parts.projectId,
      partNumber: parts.partNumber,
      name: parts.name,
      description: parts.description,
      category: parts.category,
      status: parts.status,
      currentRevisionId: parts.currentRevisionId,
      createdBy: parts.createdBy,
      createdAt: parts.createdAt,
      updatedAt: parts.updatedAt,
    })
    .from(parts)
    .innerJoin(
      partsSuppliers,
      eq(partsSuppliers.partId, parts.id)
    )
    .where(eq(partsSuppliers.supplierId, supplierId));

  return results;
}
