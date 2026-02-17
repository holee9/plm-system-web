"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Package,
  Send,
  Check,
  X,
  Settings,
  History,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChangeOrderStatusBadge } from "./change-order-status-badge";
import { AuditTrailTable } from "./audit-trail-table";
import { cn } from "@/lib/utils";

const priorityConfig = {
  urgent: { label: "긴급", className: "text-rose-600 bg-rose-50 dark:bg-rose-900/20" },
  high: { label: "높음", className: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
  medium: { label: "중간", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  low: { label: "낮음", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
};

type ChangeOrderStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "implemented";

interface ChangeOrderDetailProps {
  projectKey: string;
}

export function ChangeOrderDetail({ projectKey }: ChangeOrderDetailProps) {
  const params = useParams();
  const router = useRouter();
  const changeOrderId = params.id as string;

  const utils = trpc.useUtils();

  // Fetch change order details
  const { data: changeOrder, isLoading } = trpc.plm.changeOrder.getById.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  // Fetch audit trail
  const { data: auditTrail = [] } = trpc.plm.changeOrder.auditTrail.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  // Fetch affected parts
  const { data: impactAnalysis } = trpc.plm.changeOrder.impactAnalysis.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  ) as any;

  // Mutations
  const submitMutation = trpc.plm.changeOrder.submit.useMutation({
    onSuccess: () => {
      toast.success("변경 주문이 제출되었습니다");
      utils.plm.changeOrder.getById.invalidate({ changeOrderId });
    },
    onError: (error: any) => {
      toast.error(error.message || "제출 실패");
    },
  });

  const acceptForReviewMutation = trpc.plm.changeOrder.acceptForReview.useMutation({
    onSuccess: () => {
      toast.success("검토가 시작되었습니다");
      utils.plm.changeOrder.getById.invalidate({ changeOrderId });
    },
    onError: (error: any) => {
      toast.error(error.message || "검토 시작 실패");
    },
  });

  const reviewMutation = trpc.plm.changeOrder.review.useMutation({
    onSuccess: () => {
      toast.success("검토가 완료되었습니다");
      utils.plm.changeOrder.getById.invalidate({ changeOrderId });
    },
    onError: (error: any) => {
      toast.error(error.message || "검토 실패");
    },
  });

  const implementMutation = trpc.plm.changeOrder.implement.useMutation({
    onSuccess: () => {
      toast.success("변경이 구현되었습니다");
      utils.plm.changeOrder.getById.invalidate({ changeOrderId });
    },
    onError: (error: any) => {
      toast.error(error.message || "구현 실패");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded w-1/4 mb-6" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!changeOrder) {
    return (
      <div className="space-y-6 p-4">
        <p className="text-muted-foreground">변경 주문을 찾을 수 없습니다.</p>
        <Button onClick={() => router.back()}>뒤로 가기</Button>
      </div>
    );
  }

  const canSubmit = changeOrder.status === "draft";
  const canAccept = changeOrder.status === "submitted";
  const canReview = changeOrder.status === "in_review";
  const canImplement = changeOrder.status === "approved";

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{changeOrder.title}</h1>
              <Badge variant="outline">{changeOrder.type}</Badge>
              <ChangeOrderStatusBadge status={changeOrder.status as ChangeOrderStatus} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {changeOrder.number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canSubmit && (
            <Button onClick={() => submitMutation.mutate({ changeOrderId })} disabled={submitMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              제출
            </Button>
          )}
          {canAccept && (
            <Button onClick={() => acceptForReviewMutation.mutate({ changeOrderId })} disabled={acceptForReviewMutation.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              검토 시작
            </Button>
          )}
          {canReview && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => reviewMutation.mutate({ changeOrderId, status: "rejected", comment: "" })}
                disabled={reviewMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                거부
              </Button>
              <Button
                onClick={() => reviewMutation.mutate({ changeOrderId, status: "approved", comment: "" })}
                disabled={reviewMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                승인
              </Button>
            </div>
          )}
          {canImplement && (
            <Button onClick={() => implementMutation.mutate({ changeOrderId })} disabled={implementMutation.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              구현 완료
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">설명</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{changeOrder.description}</p>
            </CardContent>
          </Card>

          {/* Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">변경 사유</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{changeOrder.reason}</p>
            </CardContent>
          </Card>

          {/* Affected Parts */}
          {impactAnalysis && impactAnalysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  영향받는 부품 ({impactAnalysis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {impactAnalysis.map((part: any) => (
                    <div key={part.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="font-medium">{part.partNumber}</p>
                        <p className="text-sm text-muted-foreground">{part.name}</p>
                      </div>
                      <Badge variant="outline">{part.category || "분류 없음"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">세부사항</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">우선순위</span>
                <Badge variant="outline" className={priorityConfig[changeOrder.priority as keyof typeof priorityConfig]?.className}>
                  {priorityConfig[changeOrder.priority as keyof typeof priorityConfig]?.label}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">생성일</p>
                  <p className="text-sm">{new Date(changeOrder.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">마지막 업데이트</p>
                  <p className="text-sm">{new Date(changeOrder.updatedAt).toLocaleDateString("ko-KR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approvers */}
          {changeOrder.approvers && changeOrder.approvers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  승인자
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {changeOrder.approvers.map((approver: any) => (
                    <div key={approver.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {approver.user?.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{approver.user?.name || "알 수 없음"}</p>
                          <p className="text-xs text-muted-foreground">{approver.user?.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant={approver.status === "approved" ? "default" : approver.status === "rejected" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {approver.status === "pending" && "대기 중"}
                        {approver.status === "approved" && "승인됨"}
                        {approver.status === "rejected" && "거부됨"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          {auditTrail.length > 0 && (
            <AuditTrailTable changeOrderId={changeOrderId} maxHeight="400px" />
          )}
        </div>
      </div>
    </div>
  );
}
