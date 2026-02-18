/**
 * Batch Actions Component
 * Toolbar for batch operations on selected change orders
 */

"use client";

import * as React from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelection } from "./selection-provider";
import { BatchConfirmDialog, type BatchActionType } from "./batch-confirm-dialog";
import type { ChangeOrderWithDetails } from "@/modules/plm/change-order-service";

interface BatchActionsProps {
  items: ChangeOrderWithDetails[];
  onBatchApprove: (ids: string[]) => void;
  onBatchReject: (ids: string[]) => void;
  isProcessing?: boolean;
}

export function BatchActions({
  items,
  onBatchApprove,
  onBatchReject,
  isProcessing = false,
}: BatchActionsProps) {
  const {
    selectedIds,
    deselectAll,
    selectedCount,
    selectAll,
    isAllSelected,
    isSomeSelected,
  } = useSelection();

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<BatchActionType | null>(null);

  const itemIds = React.useMemo(() => items.map((item) => item.id), [items]);
  const selectedItems = React.useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const handleSelectAll = () => {
    if (isAllSelected(itemIds)) {
      deselectAll();
    } else {
      selectAll(itemIds);
    }
  };

  const handleBatchAction = (actionType: BatchActionType) => {
    setPendingAction(actionType);
    setConfirmDialogOpen(true);
  };

  const handleConfirmBatchAction = () => {
    if (pendingAction && selectedIds.length > 0) {
      if (pendingAction === "approve") {
        onBatchApprove(selectedIds);
      } else if (pendingAction === "reject") {
        onBatchReject(selectedIds);
      }
    }
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Batch Action Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-lg">
        <div className="flex items-center gap-4">
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected(itemIds)}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isSomeSelected(itemIds);
                }
              }}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label className="text-sm font-medium cursor-pointer">
              전체 선택
            </label>
          </div>

          {/* Selection Count */}
          {selectedCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <span>{selectedCount}개 선택됨</span>
              <button
                type="button"
                onClick={deselectAll}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>

        {/* Batch Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleBatchAction("approve")}
            disabled={selectedCount === 0 || isProcessing}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            일괄 승인
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleBatchAction("reject")}
            disabled={selectedCount === 0 || isProcessing}
            className="gap-2"
          >
            <XCircle className="h-4 w-4 text-red-600" />
            일괄 거부
          </Button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <BatchConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmBatchAction}
        actionType={pendingAction || "approve"}
        items={selectedItems}
        isProcessing={isProcessing}
      />
    </>
  );
}
