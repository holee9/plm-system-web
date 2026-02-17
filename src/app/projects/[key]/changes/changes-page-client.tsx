"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChangeOrderCreateDialog } from "@/components/changes/change-order-create-dialog";
import { ChangeOrderListClient } from "./change-order-list-client";

interface ChangesPageClientProps {
  projectId: string;
  projectKey: string;
  projectName: string;
}

export function ChangesPageClient({ projectId, projectKey, projectName }: ChangesPageClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  return (
    <>
      <div className="space-y-6 p-2 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{projectName}</h1>
            <Badge variant="secondary">ECR/ECN</Badge>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            새 변경 주문
          </Button>
        </div>

        {/* Content */}
        <div className="rounded-xl border bg-card p-6">
          <ChangeOrderListClient projectId={projectId} projectKey={projectKey} />
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-dashed bg-card p-6">
          <h3 className="text-base font-semibold mb-3">ECR/ECN 워크플로우 안내</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>ECR (Engineering Change Request):</strong> 제품 변경을 제안하는 변경 요청서입니다.</p>
            <p><strong>ECN (Engineering Change Notice):</strong> 승인된 변경 요청을 공식적으로 통지하는 문서입니다.</p>
            <p className="pt-2">워크플로우: 초안 → 제출 → 검토 중 → 승인됨/거부됨 → 구현됨</p>
          </div>
        </div>
      </div>

      <ChangeOrderCreateDialog
        projectId={projectId}
        projectKey={projectKey}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // Refresh the list
        }}
      />
    </>
  );
}
