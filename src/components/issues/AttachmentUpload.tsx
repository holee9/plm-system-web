"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  formatFileSize,
  getFileIcon,
  downloadFile,
  validateFileForUpload,
} from "~/lib/attachment-utils";

interface Attachment {
  id: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

interface AttachmentUploadProps {
  issueId: string;
  onUploadComplete?: (attachment: Attachment) => void;
  existingAttachments?: Attachment[];
}

export function AttachmentUpload({
  issueId,
  onUploadComplete,
  existingAttachments = [],
}: AttachmentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = api.attachment.upload.useMutation();

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file
    const validation = validateFileForUpload(file);
    if (!validation.isValid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload via fetch since tRPC doesn't support multipart/form-data
      const response = await fetch(`/api/issues/${issueId}/attachments`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      // Call completion callback
      if (data.attachment && onUploadComplete) {
        onUploadComplete(data.attachment);
      }

      // Reset form
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      await downloadFile(
        `/api/attachments/${attachment.id}/download`,
        attachment.originalFileName
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  const allAttachments = [...existingAttachments];

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!selectedFile && !isUploading && (
        <Card
          className={`border-2 border-dashed p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Upload Attachment</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Drag and drop a file here, or click to select
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileInputChange}
            accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.xml"
          />
          <label htmlFor="file-upload">
            <Button type="button" asChild>
              <span>Select File</span>
            </Button>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Maximum file size: 10MB. Allowed types: Images, PDFs, Office docs,
            text files
          </p>
        </Card>
      )}

      {/* File Preview & Upload Progress */}
      {(selectedFile || isUploading) && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <File className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{selectedFile?.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedFile && formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {!isUploading && selectedFile && (
            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Existing Attachments List */}
      {allAttachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Attachments ({allAttachments.length})
          </h4>
          {allAttachments.map((attachment) => (
            <Card key={attachment.id} className="p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label="file icon">
                  {getFileIcon(attachment.mimeType)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {attachment.originalFileName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {attachment.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
