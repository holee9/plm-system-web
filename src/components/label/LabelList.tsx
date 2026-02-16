"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Tag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  usageCount?: number;
}

interface LabelListProps {
  projectId: string;
}

const PREDEFINED_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
];

export function LabelList({ projectId }: LabelListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState({
    name: "",
    color: PREDEFINED_COLORS[6],
    description: "",
  });

  // TODO: Replace with actual tRPC call when label router is implemented
  const labels: Label[] = [];
  const isLoading = false;

  const handleCreateLabel = () => {
    if (!newLabel.name.trim()) {
      toast.error("Label name is required");
      return;
    }

    // TODO: Implement label creation
    toast.success("Label created");
    setIsCreateDialogOpen(false);
    setNewLabel({ name: "", color: PREDEFINED_COLORS[6], description: "" });
  };

  const handleDeleteLabel = (labelId: string) => {
    // TODO: Implement label deletion
    toast.success("Label deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Labels</h1>
          <p className="text-muted-foreground">
            Organize and categorize your project items
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Label
        </Button>
      </div>

      {/* Label Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Labels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {labels.length > 0 ? Math.max(...labels.map((l) => l.usageCount || 0)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">times</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Labels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {labels.filter((l) => (l.usageCount || 0) > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labels Grid */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">
          Loading labels...
        </div>
      ) : labels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No labels yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create labels to categorize and organize your project items
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Label
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {labels.map((label) => (
            <Card key={label.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="h-4 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <CardTitle className="text-lg">{label.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteLabel(label.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {label.description && (
                  <CardDescription>{label.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <Badge variant="secondary">{label.usageCount || 0} items</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Label Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Label</DialogTitle>
            <DialogDescription>
              Create a new label to categorize project items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Label name"
                value={newLabel.name}
                onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Describe this label..."
                value={newLabel.description}
                onChange={(e) => setNewLabel({ ...newLabel, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      newLabel.color === color ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewLabel({ ...newLabel, color })}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg border bg-muted/50">
              <Label className="text-xs text-muted-foreground mb-2">Preview</Label>
              <Badge
                style={{
                  backgroundColor: newLabel.color,
                  color: "#fff",
                }}
              >
                {newLabel.name || "Label Name"}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateLabel}>
              Create Label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
