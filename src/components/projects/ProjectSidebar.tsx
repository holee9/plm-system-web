// ProjectSidebar Component
"use client";

import Link from "next/link";
import { LayoutDashboard, Rows3, Package, GitMerge, Users, Settings, Flag, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProjectSidebarProps {
  project: {
    id: string;
    name: string;
    key: string;
    description: string | null;
    status: "active" | "archived";
    visibility: "private" | "public";
    teamId: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
  currentPath: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/issues", label: "Issues", icon: Rows3 },
  { href: "/board", label: "Board", icon: Rows3 },
  { href: "/parts", label: "Parts", icon: Package },
  { href: "/changes", label: "Changes", icon: GitMerge },
  { href: "/members", label: "Members", icon: Users },
  { href: "/milestones", label: "Milestones", icon: Flag },
  { href: "/labels", label: "Labels", icon: Tag },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function ProjectSidebar({ project, currentPath }: ProjectSidebarProps) {
  // Extract the base path from currentPath to match navigation
  const getIsActive = (href: string) => {
    // For dashboard, exact match
    if (href === "/dashboard") {
      return currentPath.endsWith(`/projects/${project.key}/dashboard`) ||
             currentPath === `/projects/${project.key}`;
    }
    // For other pages, check if currentPath contains the href
    return currentPath.includes(`/projects/${project.key}${href}`);
  };

  return (
    <aside className="w-64 border-r bg-background min-h-screen p-4 flex flex-col">
      {/* Project Header */}
      <div className="mb-6 px-2">
        <h2 className="font-semibold text-lg truncate">{project.name}</h2>
        <p className="text-sm text-muted-foreground">{project.key}</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item.href);
          const href = `/projects/${project.key}${item.href}`;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
