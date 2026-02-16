// Project Member List Component
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddMemberDialog } from "./AddMemberDialog";

interface ProjectMember {
  id: string;
  role: "admin" | "member" | "viewer";
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface ProjectMemberListProps {
  projectId: string;
  projectKey: string;
  initialMembers: ProjectMember[];
}

export function ProjectMemberList({
  projectId,
  projectKey,
  initialMembers,
}: ProjectMemberListProps) {
  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState<string | null>(null);

  const { data: membersData } = trpc.project.listMembers.useQuery(
    { projectId },
    {
      initialData: initialMembers,
      onSuccess: (data) => {
        setMembers(data);
      },
    }
  );

  const updateRole = trpc.project.updateMemberRole.useMutation({
    onSuccess: () => {
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const removeMember = trpc.project.removeMember.useMutation({
    onSuccess: () => {
      setMembers((prev) => prev.filter((m) => m.user.id !== removeMember.variables?.userId));
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleRoleChange = (userId: string, newRole: "admin" | "member" | "viewer") => {
    updateRole.mutate(
      {
        projectId,
        userId,
        role: newRole,
      },
      {
        onSuccess: () => {
          setMembers((prev) =>
            prev.map((m) =>
              m.user.id === userId ? { ...m, role: newRole } : m
            )
          );
        },
      }
    );
  };

  const handleRemove = (userId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMember.mutate({ projectId, userId });
    }
  };

  const handleMemberAdded = (newMember: ProjectMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <AddMemberDialog
          projectId={projectId}
          projectKey={projectKey}
          onMemberAdded={handleMemberAdded}
        />
      </div>

      <div className="border rounded-lg divide-y">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium">{member.user.name}</h3>
                <p className="text-sm text-muted-foreground">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant={
                  member.role === "admin"
                    ? "default"
                    : member.role === "member"
                    ? "secondary"
                    : "outline"
                }
              >
                {member.role}
              </Badge>

              <Select
                value={member.role}
                onValueChange={(value) =>
                  handleRoleChange(member.user.id, value as "admin" | "member" | "viewer")
                }
                disabled={updateRole.isPending}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(member.user.id)}
                disabled={removeMember.isPending}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No members yet. Add members to get started.
          </div>
        )}
      </div>
    </div>
  );
}
