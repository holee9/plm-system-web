"use client";

import { PartEntitySelector } from "./PartEntitySelector";

export interface ManufacturerSelectorProps {
  partId: string;
  selectedIds?: string[];
  onSelectionChange?: (manufacturers: any[]) => void;
  disabled?: boolean;
}

/**
 * Manufacturer selector component using unified PartEntitySelector
 *
 * @deprecated Use PartEntitySelector with entityType="manufacturer" directly
 */
export function ManufacturerSelector(props: ManufacturerSelectorProps) {
  return <PartEntitySelector {...props} entityType="manufacturer" />;
}
