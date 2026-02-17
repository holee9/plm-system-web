"use client";

import { useState } from "react";
import { GitCommit, User, Clock, GitCompare, Eye, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Revision status type
export type RevisionStatus = "draft" | "released" | "superceded";

export interface RevisionTimelineItem {
  id: string;
  revision: string; // A, B, C...
  description: string;
  reason?: string;
  status: RevisionStatus;
  createdBy: string;
  createdAt: Date | string;
  isCurrent?: boolean;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

interface RevisionTimelineProps {
  revisions: RevisionTimelineItem[];
  currentRevisionId: string;
  onRevisionSelect?: (revisionId: string) => void;
  onCompare?: (fromId: string, toId: string) => void;
  className?: string;
}

export function RevisionTimeline({
  revisions,
  currentRevisionId,
  onRevisionSelect,
  onCompare,
  className,
}: RevisionTimelineProps) {
  const [selectedRevision, setSelectedRevision] = useState<RevisionTimelineItem | null>(null);
  const [compareMode, setCompareMode] = useState<{ from?: string; to?: string }>({});

  if (!revisions || revisions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No revisions found
      </div>
    );
  }

  const getStatusVariant = (status: RevisionStatus): "default" | "success" | "secondary" => {
    switch (status) {
      case "released":
        return "success";
      case "draft":
        return "secondary";
      case "superceded":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: RevisionStatus): string => {
    switch (status) {
      case "released":
        return "Released";
      case "draft":
        return "Draft";
      case "superceded":
        return "Superseded";
      default:
        return status;
    }
  };

  const getStatusColor = (status: RevisionStatus) => {
    switch (status) {
      case "released":
        return "bg-success/10 text-success border-success/20";
      case "draft":
        return "bg-muted text-muted-foreground";
      case "superceded":
        return "bg-muted/50 text-muted-foreground";
      default:
        return "";
    }
  };

  const getDotColor = (status: RevisionStatus, isCurrent: boolean) => {
    if (isCurrent) return "bg-primary";
    switch (status) {
      case "released":
        return "bg-success";
      case "draft":
        return "bg-muted-foreground";
      case "superceded":
        return "bg-muted-foreground/50";
      default:
        return "bg-muted";
    }
  };

  const handleRevisionClick = (revision: RevisionTimelineItem) => {
    setSelectedRevision(revision);
    if (onRevisionSelect) {
      onRevisionSelect(revision.id);
    }
  };

  const handleCompareFrom = (revisionId: string) => {
    setCompareMode((prev) => ({ ...prev, from: revisionId }));
  };

  const handleCompareTo = (revisionId: string) => {
    setCompareMode((prev) => ({ ...prev, to: revisionId }));
  };

  const executeCompare = () => {
    if (compareMode.from && compareMode.to && onCompare) {
      onCompare(compareMode.from, compareMode.to);
      setCompareMode({});
    }
  };

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Compare Mode Indicator */}
        {compareMode.from && (
          <Card className="border-info/50 bg-info/5">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <GitCompare className="h-4 w-4 text-info" />
                  <span className="font-medium">Compare Mode</span>
                  <span className="text-muted-foreground">
                    From: {revisions.find((r) => r.id === compareMode.from)?.revision}
                  </span>
                  {compareMode.to && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        To: {revisions.find((r) => r.id === compareMode.to)?.revision}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {compareMode.to && (
                    <Button size="sm" variant="info" onClick={executeCompare}>
                      Compare
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setCompareMode({})}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {revisions.map((revision, index) => {
          const isLast = index === revisions.length - 1;
          const isCompareFrom = compareMode.from === revision.id;
          const isCompareTo = compareMode.to === revision.id;
          const canSelectCompareTo = compareMode.from && !isCompareFrom;

          return (
            <div key={revision.id} className="relative group">
              {/* Timeline Line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[19px] top-12 bottom-0 w-px transition-colors",
                    revision.status === "released" ? "bg-success/30" : "bg-border"
                  )}
                />
              )}

              {/* Timeline Dot */}
              <div className="absolute left-[15px] top-6 z-10">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full border-2 border-background transition-all",
                    getDotColor(revision.status, revision.isCurrent || false),
                    "group-hover:scale-125"
                  )}
                />
              </div>

              <Card
                className={cn(
                  "transition-all duration-200 cursor-pointer",
                  (revision.isCurrent || isCompareFrom || isCompareTo) &&
                    "ring-2 ring-primary/20",
                  isCompareFrom && "border-info bg-info/5",
                  isCompareTo && "border-info bg-info/5",
                  compareMode.from && !isCompareFrom && !isCompareTo && "opacity-50"
                )}
                onClick={() => handleRevisionClick(revision)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Revision Badge */}
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            getStatusColor(revision.status)
                          )}
                        >
                          <GitCommit className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span>Revision {revision.revision}</span>
                            {revision.isCurrent && (
                              <Badge variant="default" className="shrink-0">
                                Current
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge variant={getStatusVariant(revision.status)} className="shrink-0">
                        {getStatusLabel(revision.status)}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRevision(revision)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!compareMode.from && !revision.isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompareFrom(revision.id)}
                        >
                          <GitCompare className="h-4 w-4 mr-1" />
                          Compare
                        </Button>
                      )}
                      {canSelectCompareTo && !revision.isCurrent && (
                        <Button
                          size="sm"
                          variant={isCompareTo ? "default" : "outline"}
                          onClick={() => handleCompareTo(revision.id)}
                        >
                          {isCompareTo ? "Selected" : "Select"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {revision.description && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      {revision.description}
                    </p>
                  )}

                  {/* Reason/Change Note */}
                  {revision.reason && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                      <span className="font-medium">Reason: </span>
                      <span className="text-muted-foreground">{revision.reason}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Created by {revision.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(revision.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Changes Preview */}
                  {revision.changes && revision.changes.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Changes ({revision.changes.length})
                        </p>
                        <div className="space-y-1">
                          {revision.changes.slice(0, 3).map((change, idx) => (
                            <div
                              key={idx}
                              className="text-sm bg-muted/50 rounded px-3 py-2"
                            >
                              <span className="font-medium">{change.field}</span>
                              <span className="text-muted-foreground mx-2">→</span>
                              <span className="line-through text-muted-foreground mr-2">
                                {String(change.oldValue)}
                              </span>
                              <span className="text-green-600 dark:text-green-400">
                                {String(change.newValue)}
                              </span>
                            </div>
                          ))}
                          {revision.changes.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center pt-1">
                              +{revision.changes.length - 3} more changes
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedRevision}
        onOpenChange={(open) => !open && setSelectedRevision(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Revision {selectedRevision?.revision}</span>
              {selectedRevision?.isCurrent && (
                <Badge variant="default">Current</Badge>
              )}
              {selectedRevision && (
                <Badge variant={getStatusVariant(selectedRevision.status)}>
                  {getStatusLabel(selectedRevision.status)}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedRevision?.description || "No description available"}
            </DialogDescription>
          </DialogHeader>

          {selectedRevision && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created by:</span>{" "}
                  {selectedRevision.createdBy}
                </div>
                <div>
                  <span className="font-medium">Created at:</span>{" "}
                  {new Date(selectedRevision.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Reason */}
              {selectedRevision.reason && (
                <div className="p-3 bg-muted/50 rounded">
                  <p className="font-medium text-sm mb-1">Change Reason</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRevision.reason}
                  </p>
                </div>
              )}

              {/* All Changes */}
              {selectedRevision.changes && selectedRevision.changes.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm mb-3">
                      All Changes ({selectedRevision.changes.length})
                    </p>
                    <div className="space-y-2">
                      {selectedRevision.changes.map((change, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-muted/50 rounded border"
                        >
                          <p className="font-medium text-sm mb-2">{change.field}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Before:
                              </span>{" "}
                              <span className="line-through text-muted-foreground">
                                {String(change.oldValue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">After:</span>{" "}
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                {String(change.newValue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedRevision(null)}>
                  Close
                </Button>
                {!selectedRevision.isCurrent && onRevisionSelect && (
                  <Button
                    onClick={() => {
                      onRevisionSelect(selectedRevision.id);
                      setSelectedRevision(null);
                    }}
                  >
                    Select This Revision
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
