// ProjectCard Component
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProjectCardProps {
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
  href: string;
  isActive?: boolean;
}

export function ProjectCard({ project, href, isActive = false }: ProjectCardProps) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-md cursor-pointer",
          isActive && "border-primary"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {project.key}
            </Badge>
          </div>
        </CardHeader>
        {project.description && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          </CardContent>
        )}
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Last updated {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
