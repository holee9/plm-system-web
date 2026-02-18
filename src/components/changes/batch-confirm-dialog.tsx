/**
 * Batch Confirm Dialog Component
 * Confirmation dialog for batch operations on change orders
 */

"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BatchActionType = "approve" | "reject";

interface BatchConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  actionType: BatchActionType;
  items: Array<{
    id: string;
    number: string;
    title: string;
    status: string;
    type: string;
  }>;
  isProcessing?: boolean;
}

const actionConfig = {
  approve: {
    icon: CheckCircle,
    iconClassName: "text-green-600",
    title: "일괄 승인",
    description: "선택한 변경 주문을 승인합니다.",
    confirmButtonText: "승인",
    confirmButtonClassName: "bg-green-600 hover:bg-green-700",
    alertVariant: "default" as const,
  },
  reject: {
    icon: XCircle,
    iconClassName: "text-red-600",
    title: "일괄 거부",
    description: "선택한 변경 주문을 거부합니다.",
    confirmButtonText: "거부",
    confirmButtonClassName: "bg-red-600 hover:bg-red-700",
    alertVariant: "destructive" as const,
  },
};

export function BatchConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  actionType,
  items,
  isProcessing = false,
}: BatchConfirmDialogProps) {
  const config = actionConfig[actionType];
  const Icon = config.icon;
  const itemCount = items.length;

  const handleConfirm = () => {
    if (!isProcessing) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.iconClassName)} />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert */}
          <Alert variant={config.alertVariant}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {actionType === "approve" &&
                "승인된 변경 주문은 구현 단계로 진행됩니다."}
              {actionType === "reject" &&
                "거부된 변경 주문은 수정 후 재제출해야 합니다."}
            </AlertDescription>
          </Alert>

          {/* Count */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{itemCount}</p>
            <p className="text-sm text-muted-foreground">
              개의 변경 주문을 {actionType === "approve" ? "승인" : "거부"}합니다
            </p>
          </div>

          {/* Item List */}
          {itemCount > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">대상 변경 주문:</p>
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-4 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.number}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          현재 상태: {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || itemCount === 0}
            className={cn("gap-2", config.confirmButtonClassName)}
          >
            <Icon className="h-4 w-4" />
            {isProcessing ? "처리 중..." : config.confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
