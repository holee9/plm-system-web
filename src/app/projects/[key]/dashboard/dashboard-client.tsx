"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, Package, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

interface ProjectDashboardClientProps {
  projectId: string;
  projectKey: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

function StatCard({ title, value, icon: Icon, iconColor, change, changeType = "neutral" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {change && (
              <p className={cn(
                "text-xs mt-1",
                changeType === "positive" && "text-emerald-600",
                changeType === "negative" && "text-rose-600",
                changeType === "neutral" && "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", iconColor)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectDashboardClient({ projectId, projectKey }: ProjectDashboardClientProps) {
  // Fetch issues for stats
  const { data: issuesData } = trpc.issue.list.useQuery(
    { projectId, filters: {} },
    { enabled: !!projectId }
  );

  // Extract items from paginated result
  const issues = issuesData?.items ?? [];

  // Calculate stats from issues
  const totalIssues = issuesData?.total ?? issues.length;
  const openIssues = issues.filter((i: any) => i.status === "open").length;
  const inProgressIssues = issues.filter((i: any) => i.status === "in_progress").length;
  const reviewIssues = issues.filter((i: any) => i.status === "review").length;
  const doneIssues = issues.filter((i: any) => i.status === "done").length;
  const closedIssues = issues.filter((i: any) => i.status === "closed").length;

  const completedIssues = doneIssues + closedIssues;
  const activeIssues = openIssues + inProgressIssues + reviewIssues;

  // Calculate completion rate
  const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

  // Priority breakdown
  const urgentIssues = issues.filter((i: any) => i.priority === "urgent").length;
  const highPriorityIssues = issues.filter((i: any) => i.priority === "high").length;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="전체 이슈"
          value={totalIssues}
          icon={FolderKanban}
          iconColor="bg-blue-500"
        />
        <StatCard
          title="진행 중"
          value={activeIssues}
          icon={Clock}
          iconColor="bg-amber-500"
          change={totalIssues > 0 ? `${Math.round((activeIssues / totalIssues) * 100)}% of total` : undefined}
        />
        <StatCard
          title="완료됨"
          value={completedIssues}
          icon={CheckCircle2}
          iconColor="bg-emerald-500"
          change={totalIssues > 0 ? `${completionRate}% complete` : undefined}
          changeType={completionRate >= 50 ? "positive" : "neutral"}
        />
        <StatCard
          title="긴급/높음"
          value={urgentIssues + highPriorityIssues}
          icon={AlertTriangle}
          iconColor="bg-rose-500"
          changeType="negative"
        />
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">이슈 상태 분포</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusRow label="Open" count={openIssues} total={totalIssues} color="bg-slate-500" />
            <StatusRow label="In Progress" count={inProgressIssues} total={totalIssues} color="bg-blue-500" />
            <StatusRow label="Review" count={reviewIssues} total={totalIssues} color="bg-amber-500" />
            <StatusRow label="Done" count={doneIssues} total={totalIssues} color="bg-emerald-500" />
            <StatusRow label="Closed" count={closedIssues} total={totalIssues} color="bg-green-700" />
            {totalIssues === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">이슈가 없습니다</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">프로젝트 진행률</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>전체 완료율</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">빠른 작업</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/projects/${projectKey}/issues`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    이슈 보기
                  </Badge>
                </Link>
                <Link href={`/projects/${projectKey}/board`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    보드
                  </Badge>
                </Link>
                <Link href={`/projects/${projectKey}/parts`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    부품
                  </Badge>
                </Link>
                <Link href={`/projects/${projectKey}/milestones`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    마일스톤
                  </Badge>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatusRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function StatusRow({ label, count, total, color }: StatusRowProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-sm">{label}</div>
      <Progress value={percentage} className="flex-1 h-2" />
      <div className="w-8 text-right text-sm font-medium">{count}</div>
    </div>
  );
}
