"use client";

import Link from "next/link";
import {
  ClipboardList,
  FileText,
  FolderKanban,
  MessageCircle,
  PlusCircle,
  UploadCloud,
} from "lucide-react";
import { ActivityFeed } from "./activity-feed";
import { ActivityTimeline } from "./activity-timeline";
import { ChangeOrderChart, ChangeOrderDataPoint } from "./change-order-chart";
import { PartCategoryChart } from "./part-category-chart";
import { StatCard } from "./stat-card";
import { SystemHealth } from "./system-health";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const quickActions = [
  { href: "/projects", label: "New Project" },
  { href: "/issue", label: "New Issue" },
  { href: "/plm", label: "Upload Document" },
];

export function DashboardContent() {
  // Fetch all projects count
  const { data: projectsData } = trpc.project.list.useQuery(
    { limit: 1 },
    {
      select: (data) => data.total,
    }
  );

  // Fetch all issues count
  const { data: issuesData } = trpc.issue.list.useQuery(
    { projectId: "all", filters: {} },
    {
      select: (data) => ({
        total: data.total,
        inProgress: data.items?.filter((i: any) => i.status === "in_progress").length || 0,
      }),
    }
  );

  // Fetch all documents count
  const { data: documentsData } = trpc.document.list.useQuery(
    { resourceId: "all", resourceType: "project" },
    {
      enabled: false, // Not implemented yet
      select: (data) => data.length,
    }
  );

  // Stats with real data
  const stats = [
    {
      icon: FolderKanban,
      iconColor: "#2563eb",
      value: projectsData?.toString() || "0",
      label: "프로젝트",
      change: projectsData ? `${projectsData}개의 프로젝트` : "로딩 중...",
      changeColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: ClipboardList,
      iconColor: "#f59e0b",
      value: issuesData?.total.toString() || "0",
      label: "이슈",
      change: issuesData?.inProgress ? `${issuesData.inProgress}개 진행 중` : "로딩 중...",
      changeColor: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: FileText,
      iconColor: "#22c55e",
      value: documentsData?.toString() || "0",
      label: "문서",
      change: "문서 관리에서 확인",
      changeColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  // Sample activities (TODO: fetch from activity log)
  const activities = [
    {
      id: "1",
      avatar: "시스템",
      text: "PLM 시스템에 오신 것을 환영합니다",
      time: "방금",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium">시스템 상태</p>
          <p className="text-xs text-muted-foreground">tRPC health.check</p>
        </div>
        <SystemHealth />
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">PLM 시스템</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            제품 수명 주기, 프로젝트, 이슈, 문서를 단일 워크스페이스에서 관리하세요.
          </p>
          <Button asChild>
            <Link href="/projects">프로젝트로 이동</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Placeholder for change orders - shows message to go to project */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium mb-2">변경 주문 현황</p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            프로젝트별 변경 주문 통계를 확인하려면 프로젝트 대시보드로 이동하세요.
          </p>
          <Button variant="outline" asChild>
            <Link href="/projects">프로젝트 보기</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Placeholder for part categories */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium mb-2">부품 카테고리</p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            프로젝트별 부품 카테고리 분포를 확인하려면 프로젝트 대시보드로 이동하세요.
          </p>
          <Button variant="outline" asChild>
            <Link href="/projects">프로젝트 보기</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Activity Timeline with sample data */}
      <ActivityTimeline activities={activities} />

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button key={action.href} variant="outline" asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <ActivityFeed title="최근 활동" activities={activities} />
    </div>
  );
}
