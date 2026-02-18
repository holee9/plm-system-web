"use client";

import * as React from "react";
import { Search, Filter, FileDown, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeOrderList } from "@/components/changes/change-order-list";
import { SelectionProvider } from "@/components/changes/selection-provider";
import { BatchActions } from "@/components/changes/batch-actions";
import { ExportDialog } from "@/components/changes/export-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { ChangeOrderType, ChangeOrderStatus } from "@/components/changes/change-order-list";

interface ChangeOrderListClientProps {
  projectId: string;
  projectKey: string;
}

type PriorityFilter = "all" | "urgent" | "high" | "medium" | "low";

export function ChangeOrderListClient({ projectId, projectKey }: ChangeOrderListClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>("all");
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  // Fetch change orders for export
  const { data: allChangeOrders } = trpc.plm.changeOrder.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Batch mutations
  const batchApproveMutation = trpc.plm.changeOrder.batchApprove.useMutation({
    onSuccess: (data) => {
      const { success, failed } = data.data;
      if (success.length > 0) {
        toast.success(`${success.length}개의 변경 주문이 승인되었습니다.`);
      }
      if (failed.length > 0) {
        toast.error(`${failed.length}개의 변경 주문 승인 실패`);
      }
      setSelectedIds([]);
    },
    onError: (error) => {
      toast.error(`일괄 승인 실패: ${error.message}`);
    },
  });

  const batchRejectMutation = trpc.plm.changeOrder.batchReject.useMutation({
    onSuccess: (data) => {
      const { success, failed } = data.data;
      if (success.length > 0) {
        toast.success(`${success.length}개의 변경 주문이 거부되었습니다.`);
      }
      if (failed.length > 0) {
        toast.error(`${failed.length}개의 변경 주문 거부 실패`);
      }
      setSelectedIds([]);
    },
    onError: (error) => {
      toast.error(`일괄 거부 실패: ${error.message}`);
    },
  });

  // Sync filters with tab changes
  const handleTabChange = (value: string) => {
    // Priority filter remains independent
  };

  const handleBatchApprove = (ids: string[]) => {
    batchApproveMutation.mutate({ changeOrderIds: ids });
  };

  const handleBatchReject = (ids: string[]) => {
    batchRejectMutation.mutate({ changeOrderIds: ids });
  };

  const isBatchProcessing = batchApproveMutation.isPending || batchRejectMutation.isPending;

  const itemsForExport = React.useMemo(() => {
    if (!allChangeOrders) return [];
    // Use selected items if any are selected, otherwise use filtered results
    if (selectedIds.length > 0) {
      return (Array.isArray(allChangeOrders) ? allChangeOrders : allChangeOrders.items ?? [])
        .filter((co: any) => selectedIds.includes(co.id));
    }
    return Array.isArray(allChangeOrders) ? allChangeOrders : allChangeOrders.items ?? [];
  }, [allChangeOrders, selectedIds]);

  return (
    <SelectionProvider onSelectionChange={setSelectedIds}>
      <div className="space-y-4">
        {/* Search and filter bar with export button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="변경 주문 검색 (제목, 번호, 설명)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              내보내기
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 border rounded-lg bg-card">
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-xs font-medium text-muted-foreground">우선순위</label>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="urgent">긴급</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">중간</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="ecr">ECR</TabsTrigger>
          <TabsTrigger value="ecn">ECN</TabsTrigger>
          <TabsTrigger value="draft">초안</TabsTrigger>
          <TabsTrigger value="submitted">제출됨</TabsTrigger>
          <TabsTrigger value="in_review">검토 중</TabsTrigger>
          <TabsTrigger value="approved">승인됨</TabsTrigger>
          <TabsTrigger value="rejected">거부됨</TabsTrigger>
          <TabsTrigger value="implemented">구현됨</TabsTrigger>
        </TabsList>

      <TabsContent value="all" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="all"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="ecr" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="all"
          typeFilter="ECR"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="ecn" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="all"
          typeFilter="ECN"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="draft" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="draft"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="submitted" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="submitted"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="in_review" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="in_review"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="approved" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="approved"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="rejected" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="rejected"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="implemented" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="implemented"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>
    </Tabs>

    {/* Batch Actions Bar */}
    <BatchActions
      items={itemsForExport}
      onBatchApprove={handleBatchApprove}
      onBatchReject={handleBatchReject}
      isProcessing={isBatchProcessing}
    />

    {/* Export Dialog */}
    <ExportDialog
      open={exportDialogOpen}
      onOpenChange={setExportDialogOpen}
      changeOrders={itemsForExport}
    />
    </div>
    </SelectionProvider>
  );
}
