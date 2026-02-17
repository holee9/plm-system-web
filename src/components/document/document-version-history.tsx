"use client";

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  FileText,
  Download,
  Eye,
  User,
  Calendar,
  Tag,
  GitCommit,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Document version entry
 */
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  fileName: string;
  description?: string;
  uploadedBy: {
    id: string;
    name: string;
    email?: string;
  };
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
  isCurrent: boolean;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  tags?: string[];
}

/**
 * Document version history component props
 */
interface DocumentVersionHistoryProps {
  /** Document ID to fetch version history for */
  documentId: string;
  /** Optional title */
  title?: string;
  /** Optional max height */
  maxHeight?: string;
  /** Show download actions */
  showDownload?: boolean;
  /** Show restore action */
  showRestore?: boolean;
  /** Callback when version is restored */
  onRestore?: (versionId: string) => void;
  /** Optional className */
  className?: string;
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file icon based on mime type
 */
function getFileIcon(mimeType: string): string {
  const iconMap: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "image/jpeg": "IMG",
    "image/png": "PNG",
    "text/plain": "TXT",
    "application/zip": "ZIP",
  };
  return iconMap[mimeType] || "FILE";
}

/**
 * DocumentVersionHistory Component
 * @description Displays version history for a document
 */
export function DocumentVersionHistory({
  documentId,
  title = "버전 기록",
  maxHeight = "400px",
  showDownload = true,
  showRestore = false,
  onRestore,
  className,
}: DocumentVersionHistoryProps) {
  const [openVersions, setOpenVersions] = React.useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  // Fetch document versions
  // Note: This assumes a tRPC procedure exists for fetching version history
  // If not, you'll need to create it or use the document list endpoint
  const { data: versions = [], isLoading } = trpc.document.list.useQuery(
    { resourceId: documentId, resourceType: "document" } as any,
    {
      enabled: !!documentId,
    }
  );

  // Toggle version details
  const toggleVersion = (versionId: string) => {
    setOpenVersions((prev) => {
      const next = new Set(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        next.add(versionId);
      }
      return next;
    });
  };

  // Handle version restore
  const handleRestore = (versionId: string) => {
    if (onRestore) {
      onRestore(versionId);
    }
  };

  // Handle version download
  const handleDownload = async (version: DocumentVersion) => {
    if (!showDownload) return;

    setDownloadingId(version.id);
    try {
      const response = await fetch(`/api/documents/${version.id}/download`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.path) {
          window.open(data.path, "_blank");
        }
      }
    } catch (error) {
      console.error("Failed to download version:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
          {versions.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {versions.length} 버전
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              버전 기록이 없습니다
            </p>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="p-6 space-y-4">
              {versions.map((version: any, index: number) => {
                const isOpen = openVersions.has(version.id);
                const isLatest = index === 0;
                const fileIcon = getFileIcon(version.mimeType);

                return (
                  <Collapsible
                    key={version.id}
                    open={isOpen}
                    onOpenChange={() => toggleVersion(version.id)}
                  >
                    <div
                      className={cn(
                        "rounded-lg border transition-colors",
                        version.isCurrent && "border-primary bg-primary/5",
                        !version.isCurrent && "hover:bg-muted/50"
                      )}
                    >
                      {/* Header */}
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-4 p-4">
                          {/* Expand icon */}
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Version badge */}
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm",
                              version.isCurrent
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {fileIcon}
                          </div>

                          {/* Version info */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                버전 {version.version}
                              </span>
                              {version.isCurrent && (
                                <Badge variant="default" className="text-xs">
                                  현재
                                </Badge>
                              )}
                              {isLatest && !version.isCurrent && (
                                <Badge variant="secondary" className="text-xs">
                                  최신
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="font-medium">
                                {version.fileName}
                              </span>
                              <span>•</span>
                              <span>{formatFileSize(version.fileSize)}</span>
                            </div>
                          </div>

                          {/* User and time */}
                          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>{version.uploadedBy.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {format(new Date(version.uploadedAt), "yyyy.MM.dd HH:mm", {
                                  locale: ko,
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {showDownload && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(version);
                                }}
                                disabled={downloadingId === version.id}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {showRestore && !version.isCurrent && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestore(version.id);
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      {/* Expanded content */}
                      <CollapsibleContent>
                        <Separator />
                        <div className="p-4 pt-0 space-y-4">
                          {/* Description */}
                          {version.description && (
                            <div>
                              <p className="text-sm font-medium mb-1">설명</p>
                              <p className="text-sm text-muted-foreground">
                                {version.description}
                              </p>
                            </div>
                          )}

                          {/* Tags */}
                          {version.tags && version.tags.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                                <Tag className="h-3.5 w-3.5" />
                                태그
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {version.tags.map((tag: any) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Changes */}
                          {version.changes && version.changes.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                                <GitCommit className="h-3.5 w-3.5" />
                                변경 사항
                              </p>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-1/3">필드</TableHead>
                                    <TableHead className="w-1/3">이전 값</TableHead>
                                    <TableHead className="w-1/3">새 값</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {version.changes.map((change: any, idx: number) => (
                                    <TableRow key={idx}>
                                      <TableCell className="font-medium">
                                        {change.field}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground line-clamp-2">
                                        {change.oldValue || "-"}
                                      </TableCell>
                                      <TableCell className="text-foreground line-clamp-2">
                                        {change.newValue || "-"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}

                          {/* Mobile user/time info */}
                          <div className="sm:hidden flex items-center gap-4 text-xs text-muted-foreground pt-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>{version.uploadedBy.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {format(new Date(version.uploadedAt), "yyyy.MM.dd HH:mm", {
                                  locale: ko,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact version list for side panels
 */
interface DocumentVersionListProps {
  documentId: string;
  currentVersionId?: string;
  onSelect?: (versionId: string) => void;
  className?: string;
}

export function DocumentVersionList({
  documentId,
  currentVersionId,
  onSelect,
  className,
}: DocumentVersionListProps) {
  const { data: versions = [], isLoading } = trpc.document.list.useQuery(
    { resourceId: documentId, resourceType: "document" } as any,
    {
      enabled: !!documentId,
    }
  );

  if (isLoading) {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-sm text-muted-foreground">버전이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {versions.map((version: any) => {
        const isCurrent = version.id === currentVersionId;

        return (
          <button
            key={version.id}
            onClick={() => onSelect?.(version.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3",
              isCurrent
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <span className="text-xs font-mono">
              v{version.version}
            </span>
            <span className="flex-1 truncate text-sm">
              {version.fileName}
            </span>
            {isCurrent && (
              <Badge variant="secondary" className="text-xs">
                현재
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
