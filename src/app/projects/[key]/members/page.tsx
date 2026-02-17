// Project Members Page
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectMemberList } from "@/components/projects/ProjectMemberList";
import { trpc as api } from "@/lib/trpc";

type ProjectMembersPageProps = {
  params: Promise<{ key: string }>;
};

export default function ProjectMembersPage({ params }: ProjectMembersPageProps) {
  const { key } = use(params);
  const router = useRouter();

  const { data: project, isLoading: projectLoading } = api.project.getByKey.useQuery({ key });
  const { data: members = [], isLoading: membersLoading } = api.project.listMembers.useQuery(
    { projectId: project?.id || "" },
    { enabled: !!project?.id }
  );

  useEffect(() => {
    if (projectLoading) return;
    if (!project) {
      router.push(`/projects/${key}`);
    }
  }, [project, projectLoading, router, key]);

  if (projectLoading || membersLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The project you're looking for doesn't exist or you don't have access.
            </p>
            <Button asChild>
              <Link href="/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link
          href={`/projects/${key}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to project
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Project Members</h1>
          <p className="text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
      </div>

      <ProjectMemberList
        projectId={project.id}
        projectKey={project.key}
        initialMembers={members as any}
      />
    </div>
  );
}
