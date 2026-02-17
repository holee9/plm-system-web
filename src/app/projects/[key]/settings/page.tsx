// Project Settings Page
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { trpc as api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ProjectSettingsForm } from "@/components/projects/ProjectSettingsForm";

type ProjectSettingsPageProps = {
  params: Promise<{ key: string }>;
};

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { key } = use(params);
  const router = useRouter();

  const { data: project, isLoading, error } = api.project.getByKey.useQuery({ key });

  useEffect(() => {
    if (error?.message?.includes("not found") || error?.message?.includes("Access denied")) {
      router.push(`/projects/${key}`);
    }
  }, [error, router, key]);

  if (isLoading) {
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
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/projects/${key}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to project
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground">
          Manage project configuration and preferences
        </p>
      </div>

      <ProjectSettingsForm project={project} />
    </div>
  );
}
