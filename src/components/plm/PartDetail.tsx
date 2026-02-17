"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Edit, Plus, Download, ChevronRight, ChevronDown } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BomTree } from "./BomTree";
import { BomFlatTable } from "./BomFlatTable";
import { RevisionTimeline } from "./RevisionTimeline";
import { WhereUsedTable } from "./WhereUsedTable";
import { BomAddItemDialog } from "./BomAddItemDialog";
import { PartStatusBadge } from "./PartStatusBadge";
import type { PartStatus } from "@/modules/plm/types";

interface PartDetailProps {
  projectId: string;
  partId: string;
}

export function PartDetail({ projectId, partId }: PartDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddBomItemDialogOpen, setIsAddBomItemDialogOpen] = useState(false);

  // Fetch part details
  const { data: part, isLoading, refetch } = trpc.plm.part.getById.useQuery({ partId });

  // Fetch BOM tree
  const { data: bomData, isLoading: isLoadingBom } = trpc.plm.bom.getTree.useQuery(
    { partId },
    { enabled: activeTab === "bom" }
  );

  // Fetch revision history
  const { data: revisionData } = trpc.plm.revision.list.useQuery(
    { partId },
    { enabled: activeTab === "revisions" }
  );

  // Fetch where-used
  const { data: whereUsedData } = trpc.plm.part.whereUsed.useQuery(
    { partId },
    { enabled: activeTab === "where-used" }
  );

  const utils = trpc.useUtils();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading part details...</div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Part not found</div>
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!bomData?.flatList.length) return;

    const headers = ["Level", "Part Number", "Name", "Quantity", "Unit", "Path"];
    const rows = bomData.flatList.map((item: any) => [
      String(item.level),
      item.partNumber,
      item.name,
      item.quantity,
      item.unit,
      item.path,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bom-${part.partNumber}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("BOM exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (window.location.href = `/projects/${projectId}/parts`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{part.partNumber}</h1>
            <PartStatusBadge status={part.status as PartStatus} />
          </div>
          <p className="text-muted-foreground">{part.name}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => (window.location.href = `/projects/${projectId}/parts/${partId}/edit`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Part
        </Button>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Part Information</CardTitle>
          <CardDescription>Basic part details and current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Part Number</p>
              <p className="text-lg">{part.partNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{part.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p>{part.category || <span className="text-muted-foreground">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Revision</p>
              <p>{part.currentRevision?.revisionCode || <span className="text-muted-foreground">None</span>}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{part.description || <span className="text-muted-foreground">No description</span>}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revision Count</p>
              <p className="text-2xl font-bold">{part.revisionCount || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">BOM Items</p>
              <p className="text-2xl font-bold">{part.bomItemCount || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Used In</p>
              <p className="text-2xl font-bold">{part.whereUsedCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bom">
              Bill of Materials
              {bomData?.totalParts && (
                <Badge variant="secondary" className="ml-2">
                  {bomData.totalParts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="revisions">
              Revisions
              {revisionData?.total && (
                <Badge variant="secondary" className="ml-2">
                  {revisionData.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="where-used">
              Where Used
              {whereUsedData?.parents.length && (
                <Badge variant="secondary" className="ml-2">
                  {whereUsedData.parents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === "bom" && (
            <div className="flex gap-2">
              <Button onClick={() => setIsAddBomItemDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Part Overview</CardTitle>
              <CardDescription>Summary of part information and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Quick Stats</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <PartStatusBadge status={part.status as PartStatus} />
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{part.category || "Uncategorized"}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Revisions</p>
                      <p className="font-medium">{part.revisionCount || 0} versions</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">BOM Complexity</p>
                      <p className="font-medium">{part.bomItemCount || 0} items</p>
                    </div>
                  </div>
                </div>

                {part.currentRevision && (
                  <div>
                    <h4 className="font-semibold mb-2">Current Revision</h4>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-lg">
                            Revision {part.currentRevision.revisionCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(part.currentRevision.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">Latest</Badge>
                      </div>
                      {part.currentRevision.description && (
                        <p className="mt-2 text-sm">{part.currentRevision.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bom" className="space-y-4">
          {isLoadingBom ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading BOM...</div>
              </CardContent>
            </Card>
          ) : bomData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>BOM Tree</CardTitle>
                  <CardDescription>
                    Hierarchical view of Bill of Materials ({bomData.totalParts} parts, max depth: {bomData.maxLevel})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BomTree nodes={[bomData.tree]} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Flat BOM List</CardTitle>
                  <CardDescription>All parts in the BOM with level information</CardDescription>
                </CardHeader>
                <CardContent>
                  <BomFlatTable items={bomData.flatList} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">No BOM data available</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="revisions">
          {revisionData ? (
            <Card>
              <CardHeader>
                <CardTitle>Revision History</CardTitle>
                <CardDescription>
                  All changes made to this part ({revisionData.total} revisions)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevisionTimeline
                  revisions={revisionData.revisions}
                  currentRevisionId={part.currentRevisionId || ""}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">No revision history available</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="where-used">
          {whereUsedData ? (
            <Card>
              <CardHeader>
                <CardTitle>Where Used</CardTitle>
                <CardDescription>
                  Parent assemblies that include this part ({whereUsedData.parents.length} assemblies)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WhereUsedTable partNumber={part.partNumber} parents={whereUsedData.parents} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">This part is not used in any assemblies</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add BOM Item Dialog */}
      <BomAddItemDialog
        open={isAddBomItemDialogOpen}
        onOpenChange={setIsAddBomItemDialogOpen}
        parentPartId={partId}
        projectId={projectId}
        onSuccess={() => {
          utils.plm.bom.getTree.invalidate({ partId });
          utils.plm.part.whereUsed.invalidate({ partId });
        }}
      />
    </div>
  );
}
