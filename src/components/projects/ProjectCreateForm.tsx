// Project Create Form Component
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ProjectCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createProject = trpc.project.create.useMutation({
    onSuccess: (data) => {
      router.push(`/projects/${data.data.key}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!key.trim()) {
      setError("Project key is required");
      return;
    }

    createProject.mutate({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim() || undefined,
    });
  };

  const handleKeyChange = (value: string) => {
    // Auto uppercase and limit to 10 characters
    const uppercased = value.toUpperCase();
    const alphanumeric = uppercased.replace(/[^A-Z0-9]/g, "");
    setKey(alphanumeric.slice(0, 10));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Project Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome Project"
          disabled={createProject.isPending}
          maxLength={255}
          required
        />
        <p className="text-xs text-muted-foreground">
          2-255 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="key">
          Project Key <span className="text-destructive">*</span>
        </Label>
        <Input
          id="key"
          value={key}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder="PROJ01"
          disabled={createProject.isPending}
          maxLength={10}
          required
        />
        <p className="text-xs text-muted-foreground">
          2-10 uppercase letters and numbers (e.g., PLM, PROJ01)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this project is about..."
          disabled={createProject.isPending}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Optional: Provide a brief description of the project
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={createProject.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createProject.isPending}
        >
          {createProject.isPending ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
