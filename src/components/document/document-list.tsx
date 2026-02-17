"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { File, Download, Trash2, Eye, History } from "lucide-react";
import { DocumentVersionHistory } from "./document-version-history";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentListProps {
  resourceId: string;
  resourceType: "issue" | "part" | "change_order" | "project" | "milestone";
  onDownload?: (documentId: string) => void;
}

const typeIcons: Record<string, string> = {
  "application/pdf": "📄",
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  "text/plain": "📝",
  "application/vnd.ms-excel": "📊",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📝",
  "application/zip": "📦",
  default: "📎",
};

export function DocumentList({ resourceId, resourceType, onDownload }: DocumentListProps) {
  const utils = trpc.useUtils();

  // State for version history dialog
  const [versionHistoryDocId, setVersionHistoryDocId] = React.useState<string | null>(null);

  // Fetch documents
  const { data: documents = [], isLoading } = trpc.document.list.useQuery(
    { resourceId, resourceType },
    { enabled: !!resourceId }
  );

  // Delete mutation
  const deleteMutation = trpc.document.delete.useMutation({
    onSuccess: () => {
      toast.success("문서가 삭제되었습니다");
      utils.document.list.invalidate({ resourceId, resourceType });
    },
    onError: (error: any) => {
      toast.error(error.message || "삭제 실패");
    },
  });

  const handleDelete = (documentId: string) => {
    if (confirm("정말로 이 문서를 삭제하시겠습니까?")) {
      deleteMutation.mutate({ documentId });
    }
  };

  const handleDownload = async (documentId: string) => {
    if (onDownload) {
      onDownload(documentId);
      return;
    }

    // Get download path using fetch since tRPC mutation requires proper setup
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.path) {
          window.open(data.path, "_blank");
        }
      }
    } catch (error) {
      console.error("Failed to get download path:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <File className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">첨부된 문서가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"> </TableHead>
              <TableHead>파일명</TableHead>
              <TableHead>크기</TableHead>
              <TableHead>업로더</TableHead>
              <TableHead>업로드일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc: any) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <span className="text-lg">
                    {typeIcons[doc.mimeType] || typeIcons.default}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{doc.originalFileName}</p>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(doc.fileSize)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {doc.uploadedBy?.name || "알 수 없음"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: ko })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(doc.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        다운로드
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setVersionHistoryDocId(doc.id)}>
                        <History className="h-4 w-4 mr-2" />
                        버전 기록
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(doc.id)}
                        className="text-destructive"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {/* Version History Dialog */}
    <Dialog open={!!versionHistoryDocId} onOpenChange={() => setVersionHistoryDocId(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>문서 버전 기록</DialogTitle>
        </DialogHeader>
        {versionHistoryDocId && (
          <DocumentVersionHistory documentId={versionHistoryDocId} />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
