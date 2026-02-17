"use client";

import { PartEntitySelector } from "./PartEntitySelector";

export interface SupplierSelectorProps {
  partId: string;
  selectedIds?: string[];
  onSelectionChange?: (suppliers: any[]) => void;
  disabled?: boolean;
}

/**
 * Supplier selector component using unified PartEntitySelector
 *
 * @deprecated Use PartEntitySelector with entityType="supplier" directly
 */
export function SupplierSelector(props: SupplierSelectorProps) {
  return <PartEntitySelector {...props} entityType="supplier" />;
}
