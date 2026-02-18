"use client";

import * as React from "react";
import {
  Users,
  Check,
  X,
  Send,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Approver status types
 */
export type ApproverStatus = "pending" | "approved" | "rejected";

/**
 * Approver interface
 */
export interface Approver {
  id: string;
  changeOrderId: string;
  userId: string;
  status: ApproverStatus;
  comment?: string;
  reviewedAt?: Date;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

/**
 * Approval panel component props
 */
interface ApprovalPanelProps {
  /** Change order ID */
  changeOrderId: string;
  /** Optional className */
  className?: string;
  /** Callback when approval status changes */
  onApprovalComplete?: () => void;
}

/**
 * Status configuration for approvers
 */
const statusConfig: Record<
  ApproverStatus,
  { label: string; icon: typeof Clock; className: string; description: string }
> = {
  pending: {
    label: "대기 중",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    description: "아직 검토하지 않음",
  },
  approved: {
    label: "승인됨",
    icon: Check,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    description: "변경을 승인함",
  },
  rejected: {
    label: "거부됨",
    icon: X,
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
    description: "변경을 거부함",
  },
};

/**
 * ApprovalPanel Component
 * @description Panel for managing change order approvals with action buttons
 */
export function ApprovalPanel({
  changeOrderId,
  className,
  onApprovalComplete,
}: ApprovalPanelProps) {
  const [comment, setComment] = React.useState("");
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  const utils = trpc.useUtils();

  // Fetch change order details to get approval status
  const { data: changeOrder, isLoading } = trpc.plm.changeOrder.getById.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  // Review mutation
  const reviewMutation = trpc.plm.changeOrder.review.useMutation({
    onSuccess: () => {
      toast.success(isApproving ? "승인되었습니다" : "거부되었습니다");
      utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      utils.plm.changeOrder.list.invalidate();
      setComment("");
      setIsApproving(false);
      setIsRejecting(false);
      onApprovalComplete?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "검토 처리 실패");
    },
  });

  const approvers = changeOrder?.approvers as Approver[] | undefined;
  const canReview = changeOrder?.status === "in_review";
  const allApproved = approvers?.every((a) => a.status === "approved");
  const anyRejected = approvers?.some((a) => a.status === "rejected");
  const pendingCount = approvers?.filter((a) => a.status === "pending").length ?? 0;

  const handleReview = (status: "approved" | "rejected") => {
    if (!comment.trim() && status === "rejected") {
      toast.error("거부 시 코멘트를 입력해야 합니다");
      return;
    }
    reviewMutation.mutate({
      changeOrderId,
      status,
      comment: comment.trim(),
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">승인 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          승인 현황
          {approvers && approvers.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {pendingCount} / {approvers.length} 대기 중
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Approval status summary */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          {allApproved ? (
            <>
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium">모든 승인자가 승인했습니다</span>
            </>
          ) : anyRejected ? (
            <>
              <X className="h-5 w-5 text-rose-600" />
              <span className="text-sm font-medium">하나 이상의 거부가 있습니다</span>
            </>
          ) : pendingCount === approvers?.length ? (
            <>
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium">승인 대기 중입니다</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">
                {pendingCount}명의 승인자가 검토 대기 중입니다
              </span>
            </>
          )}
        </div>

        {/* Approvers list */}
        {approvers && approvers.length > 0 ? (
          <div className="space-y-3">
            {approvers.map((approver) => (
              <ApproverItem key={approver.id} approver={approver} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            승인자가 지정되지 않았습니다
          </div>
        )}

        {/* Review actions for current user */}
        {canReview && (
          <div className="pt-4 border-t space-y-3">
            <Label htmlFor="review-comment">검토 코멘트 (선택 사항)</Label>
            <Textarea
              id="review-comment"
              placeholder="검토에 대한 코멘트를 입력하세요..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <RejectDialog
                onConfirm={() => handleReview("rejected")}
                isPending={reviewMutation.isPending && isRejecting}
                disabled={reviewMutation.isPending}
                onOpenChange={(open) => {
                  if (!open) setIsRejecting(false);
                }}
              />
              <Button
                variant="default"
                className="flex-1"
                onClick={() => {
                  setIsApproving(true);
                  handleReview("approved");
                }}
                disabled={reviewMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                승인
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Individual approver item component
 */
interface ApproverItemProps {
  approver: Approver;
}

function ApproverItem({ approver }: ApproverItemProps) {
  const config = statusConfig[approver.status];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        {approver.user?.name?.[0] || approver.user?.email?.[0] || "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium">
            {approver.user?.name || "알 수 없음"}
          </p>
          <Badge variant="outline" className={cn("text-xs", config.className)}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        {approver.user?.email && (
          <p className="text-sm text-muted-foreground truncate">
            {approver.user.email}
          </p>
        )}
        {approver.comment && (
          <div className="mt-2 flex items-start gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-muted-foreground">{approver.comment}</p>
          </div>
        )}
        {approver.reviewedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(approver.reviewedAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Reject confirmation dialog
 */
interface RejectDialogProps {
  onConfirm: () => void;
  isPending: boolean;
  disabled: boolean;
  onOpenChange: (open: boolean) => void;
}

function RejectDialog({ onConfirm, isPending, disabled, onOpenChange }: RejectDialogProps) {
  return (
    <AlertDialog onOpenChange={(open) => {
      if (!open) onOpenChange(open);
    }}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="flex-1"
          disabled={disabled}
          onClick={() => onOpenChange(true)}
        >
          <X className="h-4 w-4 mr-2" />
          거부
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>변경 주문 거부</AlertDialogTitle>
          <AlertDialogDescription>
            이 변경 주문을 거부하면 승인 프로세스가 중단됩니다.
            계속하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={() => onOpenChange(false)}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "처리 중..." : "거부 확인"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Compact version of approval panel
 */
export interface ApprovalPanelCompactProps {
  changeOrderId: string;
  className?: string;
}

export function ApprovalPanelCompact({
  changeOrderId,
  className,
}: ApprovalPanelCompactProps) {
  const { data: changeOrder, isLoading } = trpc.plm.changeOrder.getById.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  if (isLoading || !changeOrder) {
    return null;
  }

  const approvers = changeOrder.approvers as Approver[] | undefined;
  const approvedCount = approvers?.filter((a) => a.status === "approved").length ?? 0;
  const totalCount = approvers?.length ?? 0;
  const pendingCount = approvers?.filter((a) => a.status === "pending").length ?? 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Users className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">
        승인: {approvedCount}/{totalCount}
      </span>
      {pendingCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {pendingCount} 대기 중
        </Badge>
      )}
    </div>
  );
}
