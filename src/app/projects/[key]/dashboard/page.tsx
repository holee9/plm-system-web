import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { ProjectDashboardClient } from "./dashboard-client";

type ProjectDashboardPageProps = {
  params: Promise<{ key: string }>;
};

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const { key } = await params;

  // Fetch project data
  const [project] = await db.select().from(projects).where(eq(projects.key, key)).limit(1);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/projects/${key}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            프로젝트
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Badge variant="secondary">대시보드</Badge>
        </div>
      </div>

      {/* Client-side Dashboard */}
      <ProjectDashboardClient projectId={project.id} projectKey={project.key} />
    </div>
  );
}
