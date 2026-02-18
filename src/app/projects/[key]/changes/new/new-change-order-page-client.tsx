"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Plus } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChangeOrderCreateDialog } from "@/components/changes/change-order-create-dialog";
import { ChangeOrderTimeline } from "@/components/changes/change-order-timeline";
import { ApprovalPanel } from "@/components/changes/approval-panel";
import { ApproverList } from "@/components/changes/approver-list";
import { ImpactAnalysisPanel } from "@/components/changes/impact-analysis-panel";
import { useChangeOrder } from "@/hooks/use-change-order";
import { cn } from "@/lib/utils";

/**
 * New Change Order Page Client Component
 * @description Page for creating a new change order with preview panels
 */
interface NewChangeOrderPageClientProps {
  projectId: string;
  projectKey: string;
  projectName: string;
}

type CreationStep = "draft" | "review" | "complete";

export function NewChangeOrderPageClient({
  projectId,
  projectKey,
  projectName,
}: NewChangeOrderPageClientProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(true);
  const [createdChangeOrderId, setCreatedChangeOrderId] = React.useState<string | null>(null);
  const [currentStep, setCurrentStep] = React.useState<CreationStep>("draft");
  const [tempFormData, setTempFormData] = React.useState<{
    type: "ECR" | "ECN";
    title: string;
    description: string;
    reason: string;
    priority: "urgent" | "high" | "medium" | "low";
  } | null>(null);

  const utils = trpc.useUtils();

  // Handle successful creation
  const handleCreationSuccess = (changeOrderId?: string) => {
    setIsCreateDialogOpen(false);
    if (changeOrderId) {
      setCreatedChangeOrderId(changeOrderId);
      setCurrentStep("complete");
      // Invalidate queries to refresh data
      utils.plm.changeOrder.list.invalidate({ projectId });
    } else {
      // Dialog was closed without creation
      router.push(`/projects/${projectKey}/changes`);
    }
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open && !createdChangeOrderId) {
      // User closed dialog without creating
      router.push(`/projects/${projectKey}/changes`);
    }
    setIsCreateDialogOpen(open);
  };

  // Handle temporary form data for preview
  const handleFormChange = (data: {
    type: "ECR" | "ECN";
    title: string;
    description: string;
    reason: string;
    priority: "urgent" | "high" | "medium" | "low";
  }) => {
    setTempFormData(data);
  };

  // Navigate back to list
  const handleBackToList = () => {
    router.push(`/projects/${projectKey}/changes`);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">새 변경 주문 생성</h1>
            <p className="text-sm text-muted-foreground">
              {projectName} • ECR/ECN 생성
            </p>
          </div>
        </div>
        <Badge variant="outline">
          {currentStep === "draft" && "초안 작성 중"}
          {currentStep === "review" && "검토 중"}
          {currentStep === "complete" && "생성 완료"}
        </Badge>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            currentStep === "draft"
              ? "bg-primary"
              : "bg-primary"
          )}
        />
        {createdChangeOrderId && (
          <>
            <div
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                currentStep === "complete" ? "bg-primary" : "bg-muted"
              )}
            />
          </>
        )}
      </div>

      {/* Creation Dialog */}
      <ChangeOrderCreateDialog
        projectId={projectId}
        projectKey={projectKey}
        open={isCreateDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={() => handleCreationSuccess(createdChangeOrderId || undefined)}
      />

      {/* Preview panels for created change order */}
      {createdChangeOrderId && currentStep === "complete" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <ChangeOrderTimeline changeOrderId={createdChangeOrderId} />
          </div>

          {/* Approval Panel */}
          <div>
            <ApprovalPanel
              changeOrderId={createdChangeOrderId}
              onApprovalComplete={() => {
                utils.plm.changeOrder.getById.invalidate({ changeOrderId: createdChangeOrderId });
              }}
            />
          </div>

          {/* Approver List */}
          <div>
            <ApproverList
              changeOrderId={createdChangeOrderId}
              detailed={true}
              showActions={false}
            />
          </div>

          {/* Impact Analysis */}
          <div className="lg:col-span-2">
            <ImpactAnalysisPanel
              changeOrderId={createdChangeOrderId}
              detailed={true}
              collapsible={true}
            />
          </div>
        </div>
      )}

      {/* Initial state message */}
      {!isCreateDialogOpen && !createdChangeOrderId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">변경 주문 생성</h2>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              ECR(변경 요청) 또는 ECN(변경 통지)을 생성하여
              엔지니어링 변경 관리 프로세스를 시작하세요.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              변경 주문 만들기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick info cards */}
      {isCreateDialogOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            title="ECR (Engineering Change Request)"
            description="변경 제안을 제출하고 승인을 요청합니다."
            icon="FileText"
            color="blue"
          />
          <InfoCard
            title="ECN (Engineering Change Notice)"
            description="승인된 변경을 통지하고 구현을 시작합니다."
            icon="CheckCircle"
            color="green"
          />
          <InfoCard
            title="승인 프로세스"
            description="지정된 승인자들의 병렬 승인 후 변경이 실행됩니다."
            icon="Users"
            color="purple"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Info card component
 */
interface InfoCardProps {
  title: string;
  description: string;
  icon: "FileText" | "CheckCircle" | "Users";
  color: "blue" | "green" | "purple";
}

function InfoCard({ title, description, icon, color }: InfoCardProps) {
  const colorConfig = {
    blue: {
      bgColor: "bg-blue-50 dark:bg-blue-950",
      textColor: "text-blue-600 dark:text-blue-400",
      iconColor: "text-blue-500",
    },
    green: {
      bgColor: "bg-green-50 dark:bg-green-950",
      textColor: "text-green-600 dark:text-green-400",
      iconColor: "text-green-500",
    },
    purple: {
      bgColor: "bg-purple-50 dark:bg-purple-950",
      textColor: "text-purple-600 dark:text-purple-400",
      iconColor: "text-purple-500",
    },
  };

  const config = colorConfig[color];

  const icons = {
    FileText: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-5 w-5", config.iconColor)}
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    CheckCircle: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-5 w-5", config.iconColor)}
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    Users: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-5 w-5", config.iconColor)}
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };

  return (
    <Card className={cn("border-2", config.textColor.replace("text-", "border-").replace("dark:", "").split(" ")[0])}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", config.bgColor)}>
            {icons[icon]}
          </div>
          <div>
            <h3 className={cn("font-semibold mb-1", config.textColor)}>{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
