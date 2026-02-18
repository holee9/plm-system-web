/**
 * useChangeOrder Hook
 *
 * Custom hook for managing change order state and operations.
 * Provides a convenient interface for change order CRUD operations,
 * status transitions, and real-time updates via TanStack Query.
 */

import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Types
export type ChangeOrderType = "ECR" | "ECN";
export type ChangeOrderStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "implemented";
export type ChangeOrderPriority = "urgent" | "high" | "medium" | "low";
export type ApproverStatus = "pending" | "approved" | "rejected";

export interface ChangeOrder {
  id: string;
  type: ChangeOrderType;
  number: string;
  title: string;
  description: string | null;
  reason: string | null;
  status: ChangeOrderStatus;
  priority: ChangeOrderPriority;
  projectId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvers?: Approver[];
  affectedParts?: AffectedPart[];
}

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

export interface AffectedPart {
  id: string;
  partId: string;
  partNumber: string;
  name: string;
  category?: string;
  status: string;
}

export interface ChangeOrderInput {
  projectId: string;
  type: ChangeOrderType;
  title: string;
  description: string;
  reason: string;
  priority: ChangeOrderPriority;
  approverIds: string[];
  affectedPartIds?: string[];
}

interface UseChangeOrderOptions {
  projectId: string;
  changeOrderId?: string;
}

/**
 * Hook for managing change order operations
 */
export function useChangeOrder({ projectId, changeOrderId }: UseChangeOrderOptions) {
  const utils = trpc.useUtils();

  // Queries
  const listQuery = trpc.plm.changeOrder.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const detailQuery = trpc.plm.changeOrder.getById.useQuery(
    { changeOrderId: changeOrderId! },
    { enabled: !!changeOrderId }
  );

  const auditTrailQuery = trpc.plm.changeOrder.auditTrail.useQuery(
    { changeOrderId: changeOrderId! },
    { enabled: !!changeOrderId }
  );

  const impactAnalysisQuery = trpc.plm.changeOrder.impactAnalysis.useQuery(
    { changeOrderId: changeOrderId! },
    { enabled: !!changeOrderId }
  );

  // Mutations
  const createMutation = trpc.plm.changeOrder.create.useMutation({
    onSuccess: () => {
      toast.success("변경 주문이 생성되었습니다");
      utils.plm.changeOrder.list.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "변경 주문 생성 실패");
    },
  });

  const updateMutation = trpc.plm.changeOrder.update.useMutation({
    onSuccess: () => {
      toast.success("변경 주문이 수정되었습니다");
      if (changeOrderId) {
        utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      }
      utils.plm.changeOrder.list.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "변경 주문 수정 실패");
    },
  });

  const deleteMutation = trpc.plm.changeOrder.delete.useMutation({
    onSuccess: () => {
      toast.success("변경 주문이 삭제되었습니다");
      utils.plm.changeOrder.list.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "변경 주문 삭제 실패");
    },
  });

  const submitMutation = trpc.plm.changeOrder.submit.useMutation({
    onSuccess: () => {
      toast.success("변경 주문이 제출되었습니다");
      if (changeOrderId) {
        utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      }
      utils.plm.changeOrder.list.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "제출 실패");
    },
  });

  const acceptForReviewMutation = trpc.plm.changeOrder.acceptForReview.useMutation({
    onSuccess: () => {
      toast.success("검토가 시작되었습니다");
      if (changeOrderId) {
        utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      }
      utils.plm.changeOrder.list.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "검토 시작 실패");
    },
  });

  const reviewMutation = trpc.plm.changeOrder.review.useMutation({
    onSuccess: () => {
      toast.success("검토가 완료되었습니다");
      if (changeOrderId) {
        utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      }
      utils.plm.changeOrder.list.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "검토 실패");
    },
  });

  const implementMutation = trpc.plm.changeOrder.implement.useMutation({
    onSuccess: () => {
      toast.success("변경이 구현되었습니다");
      if (changeOrderId) {
        utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      }
      utils.plm.changeOrder.list.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "구현 실패");
    },
  });

  const addApproverMutation = trpc.plm.changeOrder.addApprover.useMutation({
    onSuccess: () => {
      toast.success("승인자가 추가되었습니다");
      if (changeOrderId) {
        utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "승인자 추가 실패");
    },
  });

  const removeApproverMutation = trpc.plm.changeOrder.removeApprover.useMutation({
    onSuccess: () => {
      toast.success("승인자가 제거되었습니다");
      if (changeOrderId) {
        utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "승인자 제거 실패");
    },
  });

  // Helper functions
  const create = useCallback(async (input: ChangeOrderInput) => {
    return createMutation.mutateAsync(input);
  }, [createMutation]);

  const update = useCallback(async (id: string, input: Partial<ChangeOrderInput>) => {
    return updateMutation.mutateAsync({ changeOrderId: id, ...input });
  }, [updateMutation]);

  const remove = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync({ changeOrderId: id });
  }, [deleteMutation]);

  const submit = useCallback(async (id: string) => {
    return submitMutation.mutateAsync({ changeOrderId: id });
  }, [submitMutation]);

  const acceptForReview = useCallback(async (id: string) => {
    return acceptForReviewMutation.mutateAsync({ changeOrderId: id });
  }, [acceptForReviewMutation]);

  const review = useCallback(async (id: string, status: "approved" | "rejected", comment?: string) => {
    return reviewMutation.mutateAsync({ changeOrderId: id, status, comment: comment || "" });
  }, [reviewMutation]);

  const implement = useCallback(async (id: string) => {
    return implementMutation.mutateAsync({ changeOrderId: id });
  }, [implementMutation]);

  // Refresh queries
  const refresh = useCallback(() => {
    if (changeOrderId) {
      utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      utils.plm.changeOrder.auditTrail.invalidate({ changeOrderId });
      utils.plm.changeOrder.impactAnalysis.invalidate({ changeOrderId });
    }
    utils.plm.changeOrder.list.invalidate({ projectId });
  }, [changeOrderId, projectId, utils]);

  return {
    // State
    changeOrders: listQuery.data?.items ?? listQuery.data ?? [],
    changeOrder: detailQuery.data,
    auditTrail: auditTrailQuery.data ?? [],
    impactAnalysis: impactAnalysisQuery.data ?? [],

    // Loading states
    isLoadingList: listQuery.isLoading,
    isLoadingDetail: detailQuery.isLoading,
    isLoadingAuditTrail: auditTrailQuery.isLoading,
    isLoadingImpactAnalysis: impactAnalysisQuery.isLoading,

    // Error states
    listError: listQuery.error,
    detailError: detailQuery.error,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSubmitting: submitMutation.isPending,
    isAccepting: acceptForReviewMutation.isPending,
    isReviewing: reviewMutation.isPending,
    isImplementing: implementMutation.isPending,

    // Actions
    create,
    update,
    remove,
    submit,
    acceptForReview,
    review,
    implement,
    refresh,
  };
}

/**
 * Hook for getting change order status configuration
 */
export function useChangeOrderStatusConfig() {
  return {
    draft: {
      label: "초안",
      description: "작성 중인 변경 요청",
      className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      icon: "FileText",
    },
    submitted: {
      label: "제출됨",
      description: "검토 대기 중",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      icon: "Send",
    },
    in_review: {
      label: "검토 중",
      description: "검토가 진행 중입니다",
      className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      icon: "Eye",
    },
    approved: {
      label: "승인됨",
      description: "변경이 승인되었습니다",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      icon: "CheckCircle",
    },
    rejected: {
      label: "거부됨",
      description: "변경이 거부되었습니다",
      className: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
      icon: "XCircle",
    },
    implemented: {
      label: "구현됨",
      description: "변경이 구현되었습니다",
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      icon: "CheckCircle2",
    },
  };
}

/**
 * Hook for getting priority configuration
 */
export function useChangeOrderPriorityConfig() {
  return {
    urgent: {
      label: "긴급",
      description: "즉시 처리 필요",
      className: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400",
      value: 4,
    },
    high: {
      label: "높음",
      description: "높은 우선순위",
      className: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
      value: 3,
    },
    medium: {
      label: "중간",
      description: "일반적인 우선순위",
      className: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
      value: 2,
    },
    low: {
      label: "낮음",
      description: "낮은 우선순위",
      className: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
      value: 1,
    },
  };
}
