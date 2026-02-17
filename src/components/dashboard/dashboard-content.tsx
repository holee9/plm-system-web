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
import { ChangeOrderChart } from "./change-order-chart";
import { PartCategoryChart } from "./part-category-chart";
import { StatCard } from "./stat-card";
import { SystemHealth } from "./system-health";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    icon: FolderKanban,
    iconColor: "#2563eb",
    value: "12",
    label: "Projects",
    change: "+2 this month",
    changeColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: ClipboardList,
    iconColor: "#f59e0b",
    value: "45",
    label: "Issues",
    change: "7 in progress",
    changeColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: FileText,
    iconColor: "#22c55e",
    value: "89",
    label: "Documents",
    change: "+5 this week",
    changeColor: "text-emerald-600 dark:text-emerald-400",
  },
];

const activities = [
  {
    id: "1",
    avatar: "JD",
    text: "John Doe updated issue PLM-142",
    time: "2 minutes ago",
    icon: MessageCircle,
  },
  {
    id: "2",
    avatar: "SK",
    text: "Sarah Kim created project BAT-50",
    time: "15 minutes ago",
    icon: PlusCircle,
  },
  {
    id: "3",
    avatar: "MJ",
    text: "Mike Johnson uploaded BOM spec v3",
    time: "1 hour ago",
    icon: UploadCloud,
  },
];

const quickActions = [
  { href: "/projects", label: "New Project" },
  { href: "/issue", label: "New Issue" },
  { href: "/plm", label: "Upload Document" },
];

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium">System status</p>
          <p className="text-xs text-muted-foreground">tRPC health.check</p>
        </div>
        <SystemHealth />
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">PLM System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Manage product lifecycle, projects, issues, and documents from a
            single workspace.
          </p>
          <Button asChild>
            <Link href="/projects">Go to Projects</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* P4 UI: Change Order Status Chart */}
      <ChangeOrderChart data={[]} />

      {/* P4 UI: Part Category Distribution */}
      <PartCategoryChart data={[]} />

      {/* P4 UI: Activity Timeline */}
      <ActivityTimeline activities={[]} />

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button key={action.href} asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <ActivityFeed title="Recent Activity" activities={activities} />
    </div>
  );
}
