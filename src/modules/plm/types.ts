/**
 * PLM (Product Lifecycle Management) type definitions
 * Shared types for parts, revisions, BOM, manufacturers, and suppliers management
 */

import type {
  Part,
  NewPart,
  Revision,
  NewRevision,
  BomItem,
  NewBomItem,
  Manufacturer,
  Supplier,
} from "~/server/db";

// ============================================================================
// Part Types
// ============================================================================

export type PartStatus = "draft" | "active" | "obsolete";

export interface PartWithDetails extends Part {
  currentRevision?: Revision;
  revisionCount?: number;
  bomItemCount?: number;
  whereUsedCount?: number;
}

export interface CreatePartInput {
  projectId: string;
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  status?: PartStatus;
}

export interface UpdatePartInput {
  partId: string;
  name?: string;
  description?: string;
  category?: string;
  status?: PartStatus;
  changeDescription?: string; // Reason for revision
}

export interface PartSearchParams {
  projectId: string;
  query?: string; // Search in partNumber, name, description
  category?: string;
  status?: PartStatus;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Revision Types
// ============================================================================

export type RevisionStatus = "draft" | "released" | "superceded";

export interface RevisionWithChanges extends Omit<Revision, "changes"> {
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  isCurrent?: boolean;
}

export interface CreateRevisionInput {
  partId: string;
  revisionCode: string;
  description?: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  createdBy: string;
  status?: RevisionStatus;
}

// ============================================================================
// BOM Types
// ============================================================================

export interface BomItemWithDetails extends BomItem {
  parentPart?: Part;
  childPart?: Part;
}

export interface AddBomItemInput {
  parentPartId: string;
  childPartId: string;
  quantity: string;
  unit?: string;
  position?: number;
  notes?: string;
}

export interface UpdateBomItemInput {
  bomItemId: string;
  quantity?: string;
  unit?: string;
  position?: number;
  notes?: string;
}

export interface RemoveBomItemInput {
  bomItemId: string;
}

// ============================================================================
// BOM Tree Types
// ============================================================================

export interface BomTreeNode {
  partId: string;
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  status: PartStatus;
  quantity: string;
  unit: string;
  level: number;
  path: string;
  position?: number;
  notes?: string;
  children: BomTreeNode[];
  expanded?: boolean; // UI state
}

export interface FlatBomItem {
  partId: string;
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  status: PartStatus;
  quantity: string;
  unit: string;
  level: number;
  path: string;
  position?: number;
  totalQuantity?: string; // Calculated total for this part in tree
}

// ============================================================================
// Error Types
// ============================================================================

export class PlmValidationError extends Error {
  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "PlmValidationError";
  }
}

export class PlmNotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`);
    this.name = "PlmNotFoundError";
  }
}

export class PlmAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlmAccessError";
  }
}

export class BomCycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BomCycleError";
  }
}

// ============================================================================
// Response Types
// ============================================================================

export interface PartListResponse {
  parts: PartWithDetails[];
  total: number;
  limit: number;
  offset: number;
}

export interface BomTreeResponse {
  rootPart: Part;
  tree: BomTreeNode;
  flatList: FlatBomItem[];
  maxLevel: number;
  totalParts: number;
}

export interface WhereUsedResponse {
  partId: string;
  partNumber: string;
  name: string;
  parents: Array<{
    partId: string;
    partNumber: string;
    name: string;
    quantity: string;
    unit: string;
    path: string;
  }>;
}

export interface RevisionHistoryResponse {
  partId: string;
  partNumber: string;
  name: string;
  revisions: RevisionWithChanges[];
  total: number;
}

// ============================================================================
// Manufacturer Types
// ============================================================================

export interface ManufacturerWithDetails extends Manufacturer {
  partsCount?: number;
}

export interface CreateManufacturerInput {
  code: string;
  name: string;
  website?: string;
  description?: string;
}

export interface UpdateManufacturerInput {
  manufacturerId: string;
  code?: string;
  name?: string;
  website?: string;
  description?: string;
}

export interface ManufacturerSearchParams {
  query?: string; // Search in code, name, description
  limit?: number;
  offset?: number;
}

export interface ManufacturerListResponse {
  manufacturers: ManufacturerWithDetails[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Supplier Types
// ============================================================================

export interface SupplierWithDetails extends Supplier {
  partsCount?: number;
}

export interface CreateSupplierInput {
  code: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  description?: string;
}

export interface UpdateSupplierInput {
  supplierId: string;
  code?: string;
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  description?: string;
}

export interface SupplierSearchParams {
  query?: string; // Search in code, name, description
  limit?: number;
  offset?: number;
}

export interface SupplierListResponse {
  suppliers: SupplierWithDetails[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Part-Entity Linking Types
// ============================================================================

export interface LinkManufacturerInput {
  partId: string;
  manufacturerId: string;
}

export interface LinkSupplierInput {
  partId: string;
  supplierId: string;
}
