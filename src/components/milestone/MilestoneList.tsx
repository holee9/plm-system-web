"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface MilestoneListProps {
  projectId: string;
}

type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate: string;
  completedAt?: string;
  progress: number;
}

export function MilestoneList({ projectId }: MilestoneListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // TODO: Replace with actual tRPC call when milestone router is implemented
  const milestones: Milestone[] = [];
  const isLoading = false;

  const handleCreateMilestone = () => {
    // TODO: Implement milestone creation
    toast.success("Milestone created");
    setIsCreateDialogOpen(false);
    setNewMilestone({ title: "", description: "", dueDate: "" });
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: MilestoneStatus) => {
    const variants: Record<MilestoneStatus, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      in_progress: "secondary",
      overdue: "destructive",
      pending: "outline",
    };

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
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
              {milestones.filter((m) => m.status === "completed").length}
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
              {milestones.filter((m) => m.status === "in_progress").length}
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
              {milestones.filter((m) => m.status === "overdue").length}
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
          milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      {getStatusBadge(milestone.status)}
                    </div>
                    {milestone.description && (
                      <CardDescription>{milestone.description}</CardDescription>
                    )}
                  </div>
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

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                    </div>
                    {milestone.completedAt && (
                      <span className="text-green-600">
                        Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Milestone name"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this milestone..."
                rows={3}
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
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
            <Button onClick={handleCreateMilestone}>
              Create Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
