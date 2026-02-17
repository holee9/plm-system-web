// Project Layout with Sidebar
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { projects } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ProjectSidebar } from "@/components/projects/ProjectSidebar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    key: string;
  }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { key } = await params;

  // Fetch project by key
  const projectData = await db
    .select()
    .from(projects)
    .where(eq(projects.key, key))
    .limit(1);

  const project = projectData[0];

  if (!project) {
    notFound();
  }

  // In a real app, we'd get the current path from the request
  // For now, use a default
  const currentPath = `/projects/${key}`;

  return (
    <div className="flex min-h-screen">
      <ProjectSidebar project={project} currentPath={currentPath} />
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<LoadingSkeleton />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
