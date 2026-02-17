// Project Settings Form Component
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProjectSettingsFormProps {
  project: {
    id: string;
    name: string;
    key: string;
    description: string | null;
    status: "active" | "archived";
    visibility: "private" | "public";
  };
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [visibility, setVisibility] = useState<"private" | "public">(project.visibility);
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

  const restoreProject = trpc.project.restore.useMutation({
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
        visibility,
      },
    });
  };

  const handleArchive = () => {
    if (confirm("Are you sure you want to archive this project?")) {
      archiveProject.mutate({ projectId: project.id });
    }
  };

  const handleRestore = () => {
    if (confirm("Are you sure you want to restore this project?")) {
      restoreProject.mutate({ projectId: project.id });
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

        <div className="space-y-3">
          <Label>Visibility</Label>
          <RadioGroup
            value={visibility}
            onValueChange={(value) => setVisibility(value as "private" | "public")}
            disabled={updateProject.isPending}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <div className="grid gap-1.5">
                <Label htmlFor="private" className="font-medium cursor-pointer">
                  Private
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only project members can view and access this project
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <div className="grid gap-1.5">
                <Label htmlFor="public" className="font-medium cursor-pointer">
                  Public
                </Label>
                <p className="text-sm text-muted-foreground">
                  Anyone in the organization can view this project
                </p>
              </div>
            </div>
          </RadioGroup>
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

      {project.status === "archived" && (
        <div className="border border-green-500/50 bg-green-500/5 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
            Restore Project
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            This project is archived and read-only. Restore it to make changes and add new items.
          </p>
          <Button
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-500 hover:text-white dark:text-green-400 dark:border-green-400 dark:hover:bg-green-400 dark:hover:text-white"
            onClick={handleRestore}
            disabled={restoreProject.isPending}
          >
            {restoreProject.isPending ? "Restoring..." : "Restore Project"}
          </Button>
        </div>
      )}
    </div>
  );
}
