"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MilestoneListProps {
  projectId: string;
}

type MilestoneStatus = "open" | "closed";

interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  status: MilestoneStatus;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  progress?: number;
}

export function MilestoneList({ projectId }: MilestoneListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // Fetch milestones
  const {
    data: milestonesData,
    isLoading,
    refetch,
  } = trpc.project.listMilestones.useQuery({
    projectId,
    limit: 100,
  });

  // Fetch milestone progress
  const { data: progressData } = trpc.issue.getProjectMilestonesProgress.useQuery(
    {
      projectId,
    },
    {
      enabled: !!projectId && (milestonesData?.milestones?.length ?? 0) > 0,
    }
  );

  // Create mutation
  const createMilestone = trpc.project.createMilestone.useMutation({
    onSuccess: () => {
      toast.success("Milestone created successfully");
      setIsCreateDialogOpen(false);
      setNewMilestone({ title: "", description: "", dueDate: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create milestone: ${error.message}`);
    },
  });

  // Update mutation
  const updateMilestone = trpc.project.updateMilestone.useMutation({
    onSuccess: () => {
      toast.success("Milestone updated successfully");
      setIsEditDialogOpen(false);
      setEditingMilestone(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update milestone: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMilestone = trpc.project.deleteMilestone.useMutation({
    onSuccess: () => {
      toast.success("Milestone deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete milestone: ${error.message}`);
    },
  });

  // Close mutation
  const closeMilestone = trpc.project.closeMilestone.useMutation({
    onSuccess: () => {
      toast.success("Milestone closed successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to close milestone: ${error.message}`);
    },
  });

  // Reopen mutation
  const reopenMilestone = trpc.project.reopenMilestone.useMutation({
    onSuccess: () => {
      toast.success("Milestone reopened successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to reopen milestone: ${error.message}`);
    },
  });

  const milestones = milestonesData?.milestones ?? [];

  // Add progress to each milestone
  const milestonesWithProgress = milestones.map((milestone) => ({
    ...milestone,
    progress: progressData?.[milestone.id] ?? 0,
  }));

  const handleCreateMilestone = () => {
    if (!newMilestone.title.trim()) {
      toast.error("Title is required");
      return;
    }

    createMilestone.mutate({
      projectId,
      title: newMilestone.title,
      description: newMilestone.description || undefined,
      dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate) : undefined,
    });
  };

  const handleEditMilestone = () => {
    if (!editingMilestone || !newMilestone.title.trim()) {
      toast.error("Title is required");
      return;
    }

    updateMilestone.mutate({
      id: editingMilestone.id,
      data: {
        title: newMilestone.title,
        description: newMilestone.description || undefined,
        status: editingMilestone.status,
      },
    });
  };

  const handleDeleteMilestone = (id: string) => {
    if (confirm("Are you sure you want to delete this milestone?")) {
      deleteMilestone.mutate({ id });
    }
  };

  const handleToggleStatus = (milestone: Milestone) => {
    if (milestone.status === "open") {
      closeMilestone.mutate({ id: milestone.id });
    } else {
      reopenMilestone.mutate({ id: milestone.id });
    }
  };

  const openEditDialog = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setNewMilestone({
      title: milestone.title,
      description: milestone.description || "",
      dueDate: milestone.dueDate
        ? new Date(milestone.dueDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditDialogOpen(true);
  };

  const getStatusIcon = (status: MilestoneStatus, dueDate?: Date | null) => {
    if (status === "closed") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }

    if (dueDate && new Date(dueDate) < new Date()) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }

    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const getStatusBadge = (status: MilestoneStatus) => {
    return (
      <Badge
        variant={status === "closed" ? "default" : "secondary"}
        className="capitalize"
      >
        {status === "closed" ? "Completed" : "Open"}
      </Badge>
    );
  };

  const isOverdue = (milestone: Milestone) => {
    return (
      milestone.status === "open" &&
      milestone.dueDate &&
      new Date(milestone.dueDate) < new Date()
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
          <p className="text-muted-foreground">
            Track project milestones and delivery dates
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Milestone
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{milestones.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {milestones.filter((m) => m.status === "closed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {milestones.filter((m) => m.status === "open").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {milestones.filter(isOverdue).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading milestones...
          </div>
        ) : milestones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No milestones yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first milestone to track important project dates
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Milestone
              </Button>
            </CardContent>
          </Card>
        ) : (
          milestonesWithProgress.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status, milestone.dueDate)}
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      {getStatusBadge(milestone.status)}
                      {isOverdue(milestone) && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                    {milestone.description && (
                      <CardDescription>{milestone.description}</CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(milestone)}
                      >
                        {milestone.status === "open" ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Complete
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Reopen
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(milestone)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                  </div>

                  {milestone.dueDate && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Milestone Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Milestone</DialogTitle>
            <DialogDescription>
              Add a new milestone to track project progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                placeholder="Milestone name"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                placeholder="Describe this milestone..."
                rows={3}
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-dueDate">Due Date</Label>
              <Input
                id="create-dueDate"
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMilestone}
              disabled={createMilestone.isPending}
            >
              {createMilestone.isPending ? "Creating..." : "Create Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>
              Update milestone details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Milestone name"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe this milestone..."
                rows={3}
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMilestone}
              disabled={updateMilestone.isPending}
            >
              {updateMilestone.isPending ? "Updating..." : "Update Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
