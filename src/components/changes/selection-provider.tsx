/**
 * Selection Provider for Change Orders
 * Manages multi-selection state across the change order list
 */

"use client";

import * as React from "react";
import { createContext, useContext, useCallback, useMemo } from "react";

interface SelectionContextValue {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  selectedCount: number;
  isAllSelected: (ids: string[]) => boolean;
  isSomeSelected: (ids: string[]) => boolean;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(
  undefined
);

interface SelectionProviderProps {
  children: React.ReactNode;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function SelectionProvider({
  children,
  onSelectionChange,
}: SelectionProviderProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Notify parent of selection changes
  React.useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const isAllSelected = useCallback(
    (ids: string[]) =>
      ids.length > 0 && ids.every((id) => selectedIds.includes(id)),
    [selectedIds]
  );

  const isSomeSelected = useCallback(
    (ids: string[]) =>
      ids.some((id) => selectedIds.includes(id)) && !isAllSelected(ids),
    [selectedIds, isAllSelected]
  );

  const value = useMemo(
    () => ({
      selectedIds,
      toggleSelection,
      selectAll,
      deselectAll,
      isSelected,
      selectedCount: selectedIds.length,
      isAllSelected,
      isSomeSelected,
    }),
    [
      selectedIds,
      toggleSelection,
      selectAll,
      deselectAll,
      isSelected,
      isAllSelected,
      isSomeSelected,
    ]
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }

  return context;
}
