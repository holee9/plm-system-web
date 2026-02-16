/**
 * PLM Module - Product Lifecycle Management
 * Exports for parts, revisions, and BOM management
 */

// Type exports - single source of truth
export * from "./types";

// Re-export types from bom-utils for convenience
export type { BomEdge } from "./bom-utils";

// Utility exports (functions only)
export { detectCycle, buildBomTree, flattenBomTree, calculateTotalQuantity, findWhereUsed, validateBomTree } from "./bom-utils";

// Service exports
export * from "./service";

// Revision utilities
export * from "./revision-utils";

// Router
export { plmRouter } from "./router";
