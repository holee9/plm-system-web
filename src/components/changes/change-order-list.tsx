"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Settings, Plus, Search, Download, FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChangeOrderStatusBadge } from "./change-order-status-badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

export type ChangeOrderType = "ECR" | "ECN";
export type ChangeOrderStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "implemented";

export interface ChangeOrder {
  id: string;
  type: ChangeOrderType;
  number: string;
  title: string;
  description: string | null;
  status: ChangeOrderStatus;
  priority: "urgent" | "high" | "medium" | "low";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  affectedParts?: Array<{ id: string; name: string; partNumber: string }>;
}

interface ChangeOrderListProps {
  projectId: string;
  projectKey: string;
  statusFilter?: ChangeOrderStatus | "all";
  typeFilter?: ChangeOrderType | "all";
  onCreateNew?: () => void;
  searchQuery?: string;
  enableAutoRefresh?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const priorityConfig = {
  urgent: { label: "긴급", className: "text-rose-600 bg-rose-50 dark:bg-rose-900/20" },
  high: { label: "높음", className: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
  medium: { label: "중간", className: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  low: { label: "낮음", className: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
};

export function ChangeOrderList({
  projectId,
  projectKey,
  statusFilter = "all",
  typeFilter = "all",
  onCreateNew,
  searchQuery = "",
  enableAutoRefresh = true,
  selectedIds = [],
  onSelectionChange,
}: ChangeOrderListProps) {
  // Fetch change orders from PLM router with auto-refresh
  const { data: changeOrdersData, isLoading } = trpc.plm.changeOrder.list.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      refetchInterval: enableAutoRefresh ? 30000 : false, // Auto-refresh every 30s
    }
  );

  // Export mutation
  const { data: exportData, refetch: refetchExport } = trpc.plm.changeOrder.export.useQuery(
    {
      projectId,
      ...(statusFilter !== "all" && { status: statusFilter as any }),
      ...(typeFilter !== "all" && { type: typeFilter as any }),
    },
    {
      enabled: false,
    }
  );

  // Handle export
  const handleExport = async () => {
    const result = await refetchExport();
    if (result.data) {
      // Create download link
      const blob = new Blob([result.data.content], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Extract items from paginated result
  const changeOrders = Array.isArray(changeOrdersData) ? changeOrdersData : changeOrdersData?.items ?? [];

  // Filter based on props and search query
  const filteredOrders = React.useMemo(() => {
    return changeOrders.filter((co: any) => {
      if (statusFilter !== "all" && co.status !== statusFilter) return false;
      if (typeFilter !== "all" && co.type !== typeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          co.title.toLowerCase().includes(query) ||
          co.number.toLowerCase().includes(query) ||
          (co.description && co.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [changeOrders, statusFilter, typeFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredOrders.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">변경 주문이 없습니다</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            이 프로젝트에 변경 요청(ECR) 또는 변경 통지(ECN)가 없습니다.
          </p>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              첫 번째 변경 주문 만들기
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredOrders.map((co: any) => (
        <Card key={co.id} className="hover:bg-accent/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {co.type}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    {co.number}
                  </span>
                  <ChangeOrderStatusBadge status={co.status} />
                  {co.priority && priorityConfig[co.priority as keyof typeof priorityConfig] && (
                    <Badge variant="outline" className={cn("text-xs", priorityConfig[co.priority as keyof typeof priorityConfig]?.className)}>
                      {priorityConfig[co.priority as keyof typeof priorityConfig]?.label || co.priority}
                    </Badge>
                  )}
                </div>
                <Link
                  href={`/projects/${projectKey}/changes/${co.id}`}
                  className="text-base font-semibold hover:text-primary transition-colors block"
                >
                  {co.title}
                </Link>
                {co.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {co.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>생성일: {new Date(co.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/projects/${projectKey}/changes/${co.id}`}>
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
