// Project Detail Page
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trpc as api } from "@/lib/trpc";

type ProjectDetailPageProps = {
  params: Promise<{ key: string }>;
};

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { key } = use(params);
  const router = useRouter();

  const { data: project, isLoading, error } = api.project.getByKey.useQuery({ key });

  useEffect(() => {
    if (error?.message?.includes("not found") || error?.message?.includes("not found")) {
      router.push("/projects");
    }
  }, [error, router]);

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
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <span className="text-xs bg-secondary px-2 py-1 rounded">
              {project.key}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              project.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            }`}>
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${project.key}/settings`}>
              Settings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${project.key}/members`}>
              Members
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </h3>
                <p className="capitalize">{project.status}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Created
                </h3>
                <p>{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Last Updated
                </h3>
                <p>{new Date(project.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild className="w-full">
                <Link href={`/projects/${project.key}/issues`}>
                  View Issues
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/projects/${project.key}/documents`}>
                  Documents
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Project Stats</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Issues
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Documents
                </h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Members
                </h3>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
