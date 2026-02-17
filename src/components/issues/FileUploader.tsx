"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Card } from "~/components/ui/card";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import {
  formatFileSize,
  validateFileForUpload,
} from "~/lib/attachment-utils";

interface FileUploaderProps {
  issueId: string;
  onUploadComplete?: (attachment: {
    id: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }) => void;
}

export function FileUploader({
  issueId,
  onUploadComplete,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

      // Upload via fetch
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
          <h3 className="mb-2 text-lg font-semibold">파일 업로드</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            파일을 드래그하거나 클릭하여 선택하세요
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
              <span>파일 선택</span>
            </Button>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            최대 파일 크기: 10MB. 허용된 유형: 이미지, PDF, Office 문서,
            텍스트 파일
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
                업로드 중... {uploadProgress}%
              </p>
            </div>
          )}

          {!isUploading && selectedFile && (
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleUpload} disabled={isUploading}>
                <CheckCircle className="mr-2 h-4 w-4" />
                업로드
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
    </div>
  );
}
