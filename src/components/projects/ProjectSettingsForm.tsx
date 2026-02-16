// Project Settings Form Component
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProjectSettingsFormProps {
  project: {
    id: string;
    name: string;
    key: string;
    description: string | null;
    status: "active" | "archived";
  };
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [error, setError] = useState<string | null>(null);

  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => {
      router.refresh();
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const archiveProject = trpc.project.archive.useMutation({
    onSuccess: () => {
      router.push(`/projects/${project.key}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    updateProject.mutate({
      projectId: project.id,
      data: {
        name: name.trim(),
        description: description.trim() || undefined,
      },
    });
  };

  const handleArchive = () => {
    if (confirm("Are you sure you want to archive this project?")) {
      archiveProject.mutate({ projectId: project.id });
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6 border rounded-lg p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Project"
            disabled={updateProject.isPending}
            maxLength={255}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="key">Project Key</Label>
          <Input
            id="key"
            value={project.key}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Project key cannot be changed
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this project is about..."
            disabled={updateProject.isPending}
            rows={4}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={updateProject.isPending}
          >
            {updateProject.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {project.status === "active" && (
        <div className="border border-destructive/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Archiving a project will make it read-only. You can restore it later if needed.
          </p>
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={archiveProject.isPending}
          >
            {archiveProject.isPending ? "Archiving..." : "Archive Project"}
          </Button>
        </div>
      )}
    </div>
  );
}
