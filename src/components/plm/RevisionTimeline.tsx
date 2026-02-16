"use client";

import { GitCommit, User, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { RevisionWithChanges } from "@/modules/plm/types";

interface RevisionTimelineProps {
  revisions: RevisionWithChanges[];
}

export function RevisionTimeline({ revisions }: RevisionTimelineProps) {
  if (!revisions || revisions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No revisions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {revisions.map((revision, index) => (
        <div key={revision.id} className="relative">
          {index !== revisions.length - 1 && (
            <div className="absolute left-[19px] top-12 bottom-0 w-px bg-border" />
          )}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <GitCommit className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-lg">
                      Revision {revision.revisionCode}
                    </h4>
                    {index === 0 && (
                      <Badge variant="default" className="shrink-0">
                        Current
                      </Badge>
                    )}
                  </div>

                  {revision.description && (
                    <p className="text-sm mt-1">{revision.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Created by {revision.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(revision.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {revision.changes && revision.changes.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-sm font-medium mb-2">Changes</p>
                        <div className="space-y-1">
                          {revision.changes.map((change, idx) => (
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
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
