"use client";

import * as React from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, File, X, Check } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface DocumentUploadProps {
  resourceId: string;
  resourceType: "issue" | "part" | "change_order" | "project" | "milestone";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const uploadSchema = z.object({
  description: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export function DocumentUpload({
  resourceId,
  resourceType,
  open,
  onOpenChange,
  onSuccess,
}: DocumentUploadProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = React.useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const utils = trpc.useUtils();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      description: "",
    },
  });

  const uploadMutation = trpc.document.upload.useMutation({
    onSuccess: () => {
      toast.success("파일 업로드 성공");
      utils.document.list.invalidate({ resourceId, resourceType });
      setFiles([]);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "파일 업로드 실패");
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.clear();
        return newSet;
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: 파일 크기가 50MB를 초과합니다`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploadingFiles((prev) => new Set(prev).add(fileId));

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setUploadProgress((prev) => ({ ...prev, [fileId]: i }));
    }

    // Convert file to base64 for storage (in production, use proper file storage)
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const storagePath = `uploads/${resourceType}/${resourceId}/${Date.now()}-${file.name}`;

      try {
        await uploadMutation.mutateAsync({
          resourceId,
          resourceType,
          originalFileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          storagePath,
          description: form.getValues().description,
        });
      } finally {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        setUploadProgress((prev) => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error("파일을 선택해주세요");
      return;
    }

    // Upload all files
    await Promise.all(files.map((file) => uploadFile(file)));
  };

  const getTotalProgress = () => {
    const totalFiles = files.length;
    if (totalFiles === 0) return 0;
    const progressValues = Object.values(uploadProgress);
    if (progressValues.length === 0) return 0;
    return progressValues.reduce((a, b) => a + b, 0) / totalFiles;
  };

  const isUploading = uploadingFiles.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            파일 업로드
          </DialogTitle>
          <DialogDescription>
            파일을 선택하여 업로드하세요. 최대 50MB까지 가능합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection */}
          <div>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">클릭하여 파일 선택</span> 또는 drag & drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Images, Documents, CAD files (최대 50MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {files.map((file, index) => {
                    const fileId = `${file.name}-${Date.now()}`;
                    const isUploading = uploadingFiles.has(fileId);
                    const progress = uploadProgress[fileId] || 0;

                    return (
                      <div key={index} className="flex items-center gap-3 p-2 rounded border">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                          {isUploading && (
                            <Progress value={progress} className="h-1" />
                          )}
                        </div>
                        {isUploading ? (
                          <Badge variant="secondary" className="text-xs">
                            {progress}%
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFile(index)}
                            disabled={uploadingFiles.size > 0}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Form {...form}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="파일에 대한 설명을 입력하세요"
                      rows={2}
                      {...field}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFiles([]);
              form.reset();
            }}
            disabled={isUploading}
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={files.length === 0 || isUploading}>
            {isUploading ? (
              <>
                <Check className="h-4 w-4 mr-2 animate-pulse" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                업로드
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
