// Project List Component
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export function ProjectList() {
  const { data: projects, isLoading } = trpc.project.list.useQuery({
    limit: 50,
    cursor: null,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and collaborate with your team
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            New Project
          </Link>
        </Button>
      </div>

      {!projects || projects.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You don't have any projects yet
          </p>
          <Button asChild>
            <Link href="/projects/new">
              Create your first project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.items.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.key}`}
              className="block p-6 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {project.key}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="mt-4 text-xs text-muted-foreground">
                Last updated {new Date(project.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
