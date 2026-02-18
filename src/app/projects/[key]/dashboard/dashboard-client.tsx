"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, Package, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { ChangeOrderChart, ChangeOrderDataPoint } from "@/components/dashboard/change-order-chart";
import { PartCategoryChart } from "@/components/dashboard/part-category-chart";

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
  const router = useRouter();

  // Fetch complete dashboard data using the integrated API
  const { data: dashboardData, isLoading } = trpc.dashboard.getData.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Fallback: fetch individual queries if dashboard data is not available
  const { data: issuesData } = trpc.issue.list.useQuery(
    { projectId, filters: {} },
    { enabled: !!projectId && !dashboardData }
  );

  // Extract items from paginated result
  const issues = issuesData?.items ?? [];

  // Use dashboard data if available, otherwise calculate from issues
  const stats = dashboardData?.statistics;
  const totalIssues = stats?.totalIssues ?? issuesData?.total ?? 0;
  const activeIssues = stats?.openIssues ?? issues.filter((i: any) => i.status === "open" || i.status === "in_progress").length;
  const completedIssues = stats?.completedIssues ?? issues.filter((i: any) => i.status === "done" || i.status === "closed").length;
  const completionRate = stats?.issueCompletionRate ?? (totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0);

  // Use status distribution from dashboard or calculate
  const statusDistribution = dashboardData?.statusDistribution ?? [];
  const priorityDistribution = dashboardData?.priorityDistribution ?? [];

  // Get urgent/high priority count
  const urgentCount = priorityDistribution.find((p: any) => p.priority === "urgent")?.count ?? 0;
  const highCount = priorityDistribution.find((p: any) => p.priority === "high")?.count ?? 0;

  // Fetch change order statistics
  const { data: changeOrderStats } = trpc.plm.changeOrder.statistics.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Fetch parts for category chart
  const { data: partsData } = trpc.plm.part.list.useQuery(
    { projectId, limit: 100 },
    { enabled: !!projectId }
  );

  const parts = partsData?.items ?? [];

  // Calculate category distribution
  const categoryDistribution = React.useMemo(() => {
    const categories: Record<string, number> = {};
    parts.forEach((part: any) => {
      const category = part.category || "미분류";
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  }, [parts]);

  // Transform change order stats to chart data
  const changeOrderChartData: ChangeOrderDataPoint[] = React.useMemo(() => {
    if (!changeOrderStats) return [];

    return [
      { status: "draft", count: changeOrderStats.byStatus.draft, label: "초안", color: "bg-slate-500" },
      { status: "submitted", count: changeOrderStats.byStatus.submitted, label: "제출됨", color: "bg-blue-500" },
      { status: "in_review", count: changeOrderStats.byStatus.in_review, label: "검토 중", color: "bg-amber-500" },
      { status: "approved", count: changeOrderStats.byStatus.approved, label: "승인됨", color: "bg-emerald-500" },
      { status: "rejected", count: changeOrderStats.byStatus.rejected, label: "거부됨", color: "bg-rose-500" },
      { status: "implemented", count: changeOrderStats.byStatus.implemented, label: "구현됨", color: "bg-green-500" },
    ];
  }, [changeOrderStats]);

  // Get recent activities from dashboard data
  const recentActivities = dashboardData?.recentActivities ?? [];

  // Get milestones from dashboard data
  const milestones = dashboardData?.milestones ?? [];

  // Handle status filter click
  const handleStatusClick = (status: string) => {
    router.push(`/projects/${projectKey}/changes?status=${status}`);
  };

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "issue":
        return FolderKanban;
      case "change_order":
        return FileText;
      case "milestone":
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  // Get activity color based on type
  const getActivityColor = (type: string) => {
    switch (type) {
      case "issue":
        return "bg-blue-500";
      case "change_order":
        return "bg-amber-500";
      case "milestone":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

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
          change={`${completionRate}% 완료`}
          changeType={completionRate >= 50 ? "positive" : "neutral"}
        />
        <StatCard
          title="긴급/높음"
          value={urgentCount + highCount}
          icon={AlertTriangle}
          iconColor="bg-rose-500"
          changeType="negative"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ChangeOrderChart
          data={changeOrderChartData}
          total={changeOrderStats?.total}
          title="변경 주문 현황"
          onStatusClick={handleStatusClick}
        />
        <PartCategoryChart data={categoryDistribution} />
      </div>

      {/* Progress Overview and Activities */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">이슈 상태 분포</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusDistribution.length > 0 ? (
              statusDistribution.map((item: any) => (
                <StatusRow
                  key={item.status}
                  label={item.status}
                  count={item.count}
                  total={totalIssues}
                  color={
                    item.status === "done" || item.status === "closed" ? "bg-emerald-500" :
                    item.status === "in_progress" ? "bg-blue-500" :
                    item.status === "review" ? "bg-amber-500" :
                    "bg-slate-500"
                  }
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">이슈가 없습니다</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 활동</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivities.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="p-4 space-y-3">
                  {recentActivities.slice(0, 5).map((activity: any) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", getActivityColor(activity.type))}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.userName} · {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ko })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">최근 활동이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Milestones Progress */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">마일스톤 진행률</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((milestone: any) => (
              <div key={milestone.milestoneId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{milestone.title}</span>
                  <span className="text-muted-foreground">{milestone.progress}%</span>
                </div>
                <Progress value={milestone.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{milestone.completedIssueCount}/{milestone.issueCount} 이슈 완료</span>
                  {milestone.dueDate && (
                    <span>마감: {new Date(milestone.dueDate).toLocaleDateString("ko-KR")}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Link href={`/projects/${projectKey}/changes`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                변경 주문
              </Badge>
            </Link>
            <Link href={`/projects/${projectKey}/documents`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                문서
              </Badge>
            </Link>
          </div>
        </CardContent>
      </Card>
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
