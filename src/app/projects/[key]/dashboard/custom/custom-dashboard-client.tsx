"use client";

/**
 * Custom Dashboard Client Component
 * User-customizable dashboard with drag-and-drop widgets
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { WidgetGrid } from "@/components/dashboard/widget-grid";
import { WidgetConfigDialog } from "@/components/dashboard/widget-config";
import type { Widget, UserDashboard } from "~/server/db";

interface CustomDashboardClientProps {
  projectId: string;
  projectKey: string;
}

export function CustomDashboardClient({ projectId, projectKey }: CustomDashboardClientProps) {
  const router = useRouter();
  const [activeDashboardId, setActiveDashboardId] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newDashboardName, setNewDashboardName] = React.useState("");
  const [isDirty, setIsDirty] = React.useState(false);

  // Fetch dashboards
  const { data: dashboards, isLoading } = trpc.dashboard.listDashboards.useQuery({
    projectId,
  });

  // Get active dashboard
  const activeDashboard = dashboards?.find((d) => d.id === activeDashboardId);
  const defaultDashboard = dashboards?.find((d) => d.isDefault);

  // Set initial active dashboard
  React.useEffect(() => {
    if (!activeDashboardId && dashboards && dashboards.length > 0) {
      const dashboard = defaultDashboard || dashboards[0];
      setActiveDashboardId(dashboard.id);
    }
  }, [dashboards, activeDashboardId, defaultDashboard]);

  // Update dashboard mutation
  const updateDashboard = trpc.dashboard.updateDashboard.useMutation();

  // Create dashboard mutation
  const createDashboard = trpc.dashboard.createDashboard.useMutation({
    onSuccess: (dashboard) => {
      setActiveDashboardId(dashboard.id);
      setIsCreating(false);
      setNewDashboardName("");
    },
  });

  // Delete dashboard mutation
  const deleteDashboard = trpc.dashboard.deleteDashboard.useMutation({
    onSuccess: () => {
      if (activeDashboardId) {
        setActiveDashboardId(null);
      }
    },
  });

  // Add widget mutation
  const addWidget = trpc.dashboard.addWidget.useMutation();

  // Remove widget mutation
  const removeWidget = trpc.dashboard.removeWidget.useMutation();

  // Update widget mutation
  const updateWidget = trpc.dashboard.updateWidget.useMutation();

  // Auto-save with debounce (500ms) - using useRef for timer
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const scheduleAutoSave = React.useCallback((dashboardId: string, updates: any) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      updateDashboard.mutate(
        {
          dashboardId,
          ...updates,
        },
        {
          onSuccess: () => {
            setIsDirty(false);
          },
        }
      );
    }, 500);
  }, [updateDashboard]);

  // Handle widget update
  const handleWidgetUpdate = (widgetId: string, widgetUpdates: Partial<Widget>) => {
    if (!activeDashboardId) return;

    updateWidget.mutate(
      {
        dashboardId: activeDashboardId,
        widgetId,
        ...widgetUpdates,
      },
      {
        onSuccess: (data) => {
          setIsDirty(false);
        },
      }
    );

    setIsDirty(true);
  };

  // Handle widget removal
  const handleWidgetRemove = (widgetId: string) => {
    if (!activeDashboardId) return;

    removeWidget.mutate({
      dashboardId: activeDashboardId,
      widgetId,
    });
  };

  // Handle add widget
  const handleAddWidget = (widget: Omit<Widget, "id"> & { id?: string }) => {
    if (!activeDashboardId) return;

    addWidget.mutate({
      dashboardId: activeDashboardId,
      widget,
    });
  };

  // Handle create dashboard
  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) return;

    createDashboard.mutate({
      name: newDashboardName,
      projectId,
      layout: {
        columns: 12,
        rows: 1,
        widgets: [],
      },
    });
  };

  // Handle delete dashboard
  const handleDeleteDashboard = (dashboardId: string) => {
    if (dashboards && dashboards.length <= 1) {
      alert("Cannot delete the last dashboard");
      return;
    }

    if (confirm("Are you sure you want to delete this dashboard?")) {
      deleteDashboard.mutate({
        dashboardId: dashboardId,
      });
    }
  };

  // Handle set as default
  const handleSetDefault = (dashboardId: string) => {
    updateDashboard.mutate({
      dashboardId,
      isDefault: true,
    });
  };

  if (isLoading) {
    return <CustomDashboardSkeleton />;
  }

  if (!dashboards || dashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LayoutGrid className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Custom Dashboards</h3>
        <p className="text-muted-foreground text-center mb-4">
          Create your first custom dashboard to get started
        </p>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Dashboard</h2>
          <p className="text-muted-foreground">
            {activeDashboard?.name}
            {isDirty && <span className="ml-2 text-yellow-600">(Unsaved)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projects/${projectKey}/dashboard`)}
          >
            Back to Default
          </Button>
          <WidgetConfigDialog onAdd={handleAddWidget} />
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeDashboardId || undefined} onValueChange={(v) => setActiveDashboardId(v)}>
        <div className="flex items-center justify-between">
          <TabsList>
            {dashboards.map((dashboard) => (
              <div key={dashboard.id} className="flex items-center gap-1">
                <TabsTrigger value={dashboard.id} className="gap-2">
                  {dashboard.name}
                  {dashboard.isDefault && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </TabsTrigger>
                {dashboards.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDeleteDashboard(dashboard.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeDashboard && !activeDashboard.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeDashboardId && handleSetDefault(activeDashboardId)}
              >
                Set as Default
              </Button>
            )}
          </div>
        </div>

        {dashboards.map((dashboard) => (
          <TabsContent key={dashboard.id} value={dashboard.id}>
            <Card>
              <CardContent className="p-6">
                {dashboard.layout.widgets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <LayoutGrid className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No widgets yet. Add your first widget to get started.
                    </p>
                  </div>
                ) : (
                  <WidgetGrid
                    widgets={dashboard.layout.widgets}
                    onWidgetUpdate={handleWidgetUpdate}
                    onWidgetRemove={handleWidgetRemove}
                  >
                    {(widget) => <WidgetContent widget={widget} projectId={projectId} />}
                  </WidgetGrid>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Dashboard Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
            <DialogDescription>
              Enter a name for your new custom dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Dashboard name"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateDashboard();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDashboard}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Widget content renderer
function WidgetContent({ widget, projectId }: { widget: Widget; projectId: string }) {
  const { title } = widget.config;

  switch (widget.type) {
    case "stat":
      return (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{title || "Statistics"}</h3>
          <div className="text-3xl font-bold">Loading...</div>
          <p className="text-xs text-muted-foreground mt-1">{widget.config.metric}</p>
        </div>
      );

    case "chart":
      return (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{title || "Chart"}</h3>
          <div className="h-48 bg-muted/30 rounded flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Chart: {widget.config.chartType}</p>
          </div>
        </div>
      );

    case "list":
      return (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{title || "List"}</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted/30 rounded" />
            ))}
          </div>
        </div>
      );

    case "table":
      return (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{title || "Table"}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Column 1</th>
                  <th className="text-left p-2">Column 2</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Data 1</td>
                  <td className="p-2">Data 2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    default:
      return <div>Unknown widget type</div>;
  }
}

function CustomDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="col-span-3 h-48" />
            <Skeleton className="col-span-3 h-48" />
            <Skeleton className="col-span-6 h-48" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
