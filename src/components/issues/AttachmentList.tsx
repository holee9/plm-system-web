"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Download, Trash2, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { formatFileSize, getFileIcon, downloadFile } from "~/lib/attachment-utils";
import type { IssueAttachment } from "~/modules/issue/types";

interface AttachmentListProps {
  issueId: string;
  attachments: IssueAttachment[];
  currentUserId?: string;
  isProjectAdmin?: boolean;
  onDelete?: (attachmentId: string) => void;
  isLoading?: boolean;
}

export function AttachmentList({
  issueId,
  attachments,
  currentUserId,
  isProjectAdmin = false,
  onDelete,
  isLoading = false,
}: AttachmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (attachment: IssueAttachment) => {
    try {
      await downloadFile(
        `/api/attachments/${attachment.id}/download`,
        attachment.originalFileName
      );
    } catch (err) {
      console.error("Download error:", err);
      // You could add a toast notification here
    }
  };

  const handleDelete = async (attachmentId: string) => {
    setDeletingId(attachmentId);
    try {
      // Call delete API
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }

      // Call onDelete callback
      if (onDelete) {
        onDelete(attachmentId);
      }
    } catch (err) {
      console.error("Delete error:", err);
      // You could add a toast notification here
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (attachment: IssueAttachment) => {
    return isProjectAdmin || attachment.uploadedBy === currentUserId;
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading attachments...</span>
        </div>
      </Card>
    );
  }

  if (attachments.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">No attachments yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="p-4">
          <div className="flex items-center gap-4">
            {/* File Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl">
              {getFileIcon(attachment.mimeType)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" title={attachment.originalFileName}>
                {attachment.originalFileName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(attachment.uploadedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* MIME Type Badge */}
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {attachment.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
            </Badge>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(attachment)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>

              {canDelete(attachment) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === attachment.id}
                      title="Delete"
                    >
                      {deletingId === attachment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Attachment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;
                        {attachment.originalFileName}&quot;? This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(attachment.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Import useState at the top
import { useState } from "react";
