"use client";

import * as React from "react";
import { Upload, FileText, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
];

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface DocumentUploadZoneProps {
  resourceId: string;
  resourceType: "issue" | "part" | "change_order" | "project" | "milestone";
  onUploadComplete?: () => void;
}

export function DocumentUploadZone({
  resourceId,
  resourceType,
  onUploadComplete,
}: DocumentUploadZoneProps) {
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = React.useState(false);
  const [files, setFiles] = React.useState<UploadFile[]>([]);
  const [description, setDescription] = React.useState("");

  const uploadMutation = trpc.document.upload.useMutation({
    onSuccess: () => {
      toast.success("문서가 업로드되었습니다");
      utils.document.list.invalidate({ resourceId, resourceType });
      utils.document.listAll.invalidate({ resourceId, resourceType });
      setFiles([]);
      setDescription("");
      setIsOpen(false);
      onUploadComplete?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "업로드 실패");
    },
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Show errors for rejected files
      rejectedFiles.forEach(({ file, errors }: any) => {
        const errorMsg = errors[0]?.code === "file-too-large"
          ? "파일 크기가 50MB를 초과합니다"
          : errors[0]?.code === "file-invalid-type"
          ? "지원하지 않는 파일 형식입니다"
          : "업로드할 수 없는 파일입니다";
        toast.error(`${file.name}: ${errorMsg}`);
      });

      // Add accepted files
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: "pending",
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "text/plain": [".txt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/zip": [".zip"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      if (fileData.status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading", progress: 0 } : f
        )
      );

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f, idx) => {
              if (idx === i && f.status === "uploading" && f.progress < 90) {
                return { ...f, progress: f.progress + 10 };
              }
              return f;
            })
          );
        }, 100);

        // Upload file (convert to base64 for now - in production use proper file storage)
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          const storagePath = `/${resourceType}/${resourceId}/${fileData.file.name}`;

          await uploadMutation.mutateAsync({
            resourceId,
            resourceType,
            originalFileName: fileData.file.name,
            mimeType: fileData.file.type,
            fileSize: fileData.file.size,
            storagePath,
            description: description || undefined,
          });

          clearInterval(progressInterval);
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, progress: 100, status: "success" } : f
            )
          );
        };

        reader.onerror = () => {
          clearInterval(progressInterval);
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "error", error: "파일 읽기 실패" } : f
            )
          );
        };

        reader.readAsDataURL(fileData.file);
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: "업로드 실패" } : f
          )
        );
      }
    }
  };

  const pendingFiles = files.filter((f) => f.status === "pending");
  const isUploading = files.some((f) => f.status === "uploading");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          문서 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>문서 업로드</DialogTitle>
          <DialogDescription>
            최대 50MB의 파일을 업로드할 수 있습니다 (PDF, 이미지, Office 문서)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">파일을 여기에 놓으세요...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, 이미지, Word, Excel, ZIP (최대 50MB)
                </p>
              </>
            )}
          </div>

          {/* File list */}
          {files.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-2">
                {files.map((fileData, index) => {
                  const isError = fileData.status === "error";
                  const isSuccess = fileData.status === "success";

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg border",
                        isError && "border-destructive bg-destructive/5",
                        isSuccess && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                      )}
                    >
                      <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {fileData.status === "uploading" && (
                          <Progress value={fileData.progress} className="h-1 mt-1" />
                        )}
                        {isError && (
                          <p className="text-xs text-destructive">{fileData.error}</p>
                        )}
                        {isSuccess && (
                          <p className="text-xs text-emerald-600">업로드 완료</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => removeFile(index)}
                        disabled={fileData.status === "uploading"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Description input */}
          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Textarea
              id="description"
              placeholder="문서에 대한 설명을 입력하세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={pendingFiles.length === 0 || isUploading}
            >
              {isUploading ? "업로드 중..." : "업로드"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
