// Project List Component
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ProjectCard } from "./ProjectCard";

export function ProjectList() {
  const { data: projects, isLoading } = trpc.project.list.useQuery({
    limit: 50,
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

      {!projects || projects.projects.length === 0 ? (
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
          {projects.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              href={`/projects/${project.key}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
