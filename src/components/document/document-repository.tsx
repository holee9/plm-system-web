"use client";

import * as React from "react";
import { FileText, FolderOpen, Search, Filter, Download, Eye, Trash2, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentUploadZone } from "./document-upload-zone";
import { DocumentVersionHistory } from "./document-version-history";
import { cn } from "@/lib/utils";

// File type icons
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

// Resource type labels
const resourceTypeLabels: Record<string, string> = {
  issue: "이슈",
  part: "부품",
  change_order: "변경 주문",
  project: "프로젝트",
  milestone: "마일스톤",
};

interface DocumentRepositoryProps {
  projectId?: string;
}

export function DocumentRepository({ projectId }: DocumentRepositoryProps) {
  const utils = trpc.useUtils();

  // State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [resourceFilter, setResourceFilter] = React.useState<string>("all");
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [versionHistoryDocId, setVersionHistoryDocId] = React.useState<string | null>(null);

  // Fetch all documents for the project
  const { data: documents = [], isLoading } = trpc.document.listAll.useQuery(
    {
      resourceId: projectId || "",
      resourceType: "project",
    },
    {
      enabled: !!projectId,
    }
  );

  // Delete mutation
  const deleteMutation = trpc.document.delete.useMutation({
    onSuccess: () => {
      toast.success("문서가 삭제되었습니다");
      if (projectId) {
        utils.document.list.invalidate({ resourceId: projectId, resourceType: "project" });
        utils.document.listAll.invalidate({ resourceId: projectId, resourceType: "project" });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "삭제 실패");
    },
  });

  // Update description mutation
  const updateDescriptionMutation = trpc.document.updateDescription.useMutation({
    onSuccess: () => {
      toast.success("설명이 업데이트되었습니다");
      if (projectId) {
        utils.document.list.invalidate({ resourceId: projectId, resourceType: "project" });
        utils.document.listAll.invalidate({ resourceId: projectId, resourceType: "project" });
      }
      setSelectedDocId(null);
    },
  });

  // Filter documents
  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc: any) => {
      const matchesSearch =
        !searchQuery ||
        doc.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || doc.mimeType === typeFilter;
      const matchesResource = resourceFilter === "all" || doc.resourceType === resourceFilter;

      return matchesSearch && matchesType && matchesResource;
    });
  }, [documents, searchQuery, typeFilter, resourceFilter]);

  // Group by resource
  const groupedByResource = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredDocuments.forEach((doc: any) => {
      const key = `${doc.resourceType}-${doc.resourceId}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(doc);
    });
    return groups;
  }, [filteredDocuments]);

  const handleDownload = async (documentId: string) => {
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
      console.error("Failed to download:", error);
      toast.error("다운로드 실패");
    }
  };

  const handleDelete = (documentId: string) => {
    if (confirm("정말로 이 문서를 삭제하시겠습니까?")) {
      deleteMutation.mutate({ documentId });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">문서 저장소</h1>
          <p className="text-muted-foreground mt-1">
            {documents.length}개의 문서
          </p>
        </div>
        {projectId && (
          <DocumentUploadZone
            resourceId={projectId}
            resourceType="project"
            onUploadComplete={() => {
              // Refetch handled by mutation success
            }}
          />
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="문서 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="파일 형식" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 형식</SelectItem>
                <SelectItem value="application/pdf">PDF</SelectItem>
                <SelectItem value="image/jpeg">JPEG</SelectItem>
                <SelectItem value="image/png">PNG</SelectItem>
                <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                  Word
                </SelectItem>
                <SelectItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                  Excel
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Resource filter */}
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="리소스" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 리소스</SelectItem>
                <SelectItem value="issue">이슈</SelectItem>
                <SelectItem value="part">부품</SelectItem>
                <SelectItem value="change_order">변경 주문</SelectItem>
                <SelectItem value="milestone">마일스톤</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium mb-2">문서가 없습니다</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || typeFilter !== "all" || resourceFilter !== "all"
                ? "필터링된 문서가 없습니다"
                : "새 문서를 업로드하여 시작하세요"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"> </TableHead>
                  <TableHead>파일명</TableHead>
                  <TableHead>형식</TableHead>
                  <TableHead>크기</TableHead>
                  <TableHead>리소스</TableHead>
                  <TableHead>버전</TableHead>
                  <TableHead>업로더</TableHead>
                  <TableHead>업로드일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc: any) => (
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
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {doc.mimeType.split("/")[1] || "파일"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {resourceTypeLabels[doc.resourceType] || doc.resourceType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">v{doc.version}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {doc.uploadedBy?.name || "알 수 없음"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(doc.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
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
                            <Eye className="h-4 w-4 mr-2" />
                            버전 기록
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedDocId(doc.id)}>
                            <Upload className="h-4 w-4 mr-2" />
                            새 버전 업로드
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(doc.id)}
                            className="text-destructive"
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
      )}

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
    </div>
  );
}
