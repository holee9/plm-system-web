// Add Member Dialog Component
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddMemberDialogProps {
  projectId: string;
  projectKey: string;
  onMemberAdded: (member: any) => void;
}

export function AddMemberDialog({
  projectId,
  projectKey,
  onMemberAdded,
}: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [error, setError] = useState<string | null>(null);

  // For now, we'll use a simple email lookup
  // In production, you'd want a proper user search
  const { data: users } = trpc.user.list.useQuery(
    { limit: 100 },
    { enabled: open }
  );

  const addMember = trpc.project.addMember.useMutation({
    onSuccess: (data: any) => {
      onMemberAdded(data.data);
      setOpen(false);
      setEmail("");
      setRole("member");
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Find user by email
    const user = users?.find((u) => u.email === email);
    if (!user) {
      setError("User not found");
      return;
    }

    addMember.mutate({
      projectId,
      userId: user.id,
      role,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project Member</DialogTitle>
          <DialogDescription>
            Add a team member to this project and assign their role
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={addMember.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as "admin" | "member" | "viewer")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={addMember.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
