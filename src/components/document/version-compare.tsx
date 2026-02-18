"use client";

/**
 * Version Compare Component
 * Side-by-side diff view for document version comparison
 */
import * as React from "react";
import { ArrowLeft, ArrowRight, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReactDiffViewer from "react-diff-viewer-continued";
import Image from "next/image";

interface VersionCompareProps {
  resourceId: string;
  resourceType: "issue" | "part" | "change_order" | "project" | "milestone";
  originalFileName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function VersionCompare({
  resourceId,
  resourceType,
  originalFileName,
  open: controlledOpen,
  onOpenChange,
}: VersionCompareProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [baseVersionId, setBaseVersionId] = React.useState<string>("");
  const [compareVersionId, setCompareVersionId] = React.useState<string>("");
  const [isComparing, setIsComparing] = React.useState(false);

  // Fetch all versions
  const { data: versions = [], isLoading: isLoadingVersions } = trpc.document.versions.useQuery(
    {
      resourceId,
      resourceType,
      originalFileName,
    },
    {
      enabled: open,
    }
  );

  // Fetch full document details for selected versions
  const { data: baseDocument } = trpc.document.getById.useQuery(
    { documentId: baseVersionId },
    { enabled: open && !!baseVersionId }
  );

  const { data: compareDocument } = trpc.document.getById.useQuery(
    { documentId: compareVersionId },
    { enabled: open && !!compareVersionId }
  );

  // Auto-select first two versions on load
  React.useEffect(() => {
    if (versions.length >= 2 && !baseVersionId && !compareVersionId) {
      // Select oldest as base, newest as compare
      const sortedVersions = [...versions].sort((a, b) => a.version - b.version);
      setBaseVersionId(sortedVersions[0].id);
      setCompareVersionId(sortedVersions[sortedVersions.length - 1].id);
    }
  }, [versions, baseVersionId, compareVersionId]);

  const handleCompare = async () => {
    if (!baseVersionId || !compareVersionId) {
      toast.error("버전을 선택해주세요");
      return;
    }

    if (baseVersionId === compareVersionId) {
      toast.error("동일한 버전은 비교할 수 없습니다");
      return;
    }

    setIsComparing(true);

    // For text files, we'll fetch content
    // For images, we'll show visual comparison
    // For binary files, we'll show metadata only
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isTextFile = baseDocument?.mimeType?.startsWith("text/");
  const isImageFile = baseDocument?.mimeType?.startsWith("image/");
  const canShowDiff = isTextFile;

  const sortedVersions = [...versions].sort((a, b) => a.version - b.version);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              버전 비교
            </span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {originalFileName}의 버전 간 변경사항을 비교합니다
          </DialogDescription>
        </DialogHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Version Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block" aria-label="Base version">
                기준 버전
              </label>
              <Select value={baseVersionId} onValueChange={setBaseVersionId}>
                <SelectTrigger>
                  <SelectValue placeholder="버전 선택" />
                </SelectTrigger>
                <SelectContent>
                  {sortedVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      v{version.version} - {version.uploadedByName} ({formatDate(version.createdAt)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCompare}
              disabled={!baseVersionId || !compareVersionId || baseVersionId === compareVersionId}
            >
              비교
            </Button>

            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block" aria-label="Compare version">
                비교 버전
              </label>
              <Select value={compareVersionId} onValueChange={setCompareVersionId}>
                <SelectTrigger>
                  <SelectValue placeholder="버전 선택" />
                </SelectTrigger>
                <SelectContent>
                  {sortedVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      v{version.version} - {version.uploadedByName} ({formatDate(version.createdAt)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metadata Comparison */}
          {isComparing && baseDocument && compareDocument && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">메타데이터 비교</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">항목</TableHead>
                      <TableHead>
                        v{baseDocument.version} (기준)
                      </TableHead>
                      <TableHead>
                        v{compareDocument.version} (비교)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">파일명</TableCell>
                      <TableCell>{baseDocument.originalFileName}</TableCell>
                      <TableCell>{compareDocument.originalFileName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">파일 크기</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            compareDocument.fileSize > baseDocument.fileSize
                              ? "destructive"
                              : compareDocument.fileSize < baseDocument.fileSize
                              ? "default"
                              : "secondary"
                          }
                        >
                          {formatFileSize(baseDocument.fileSize)}
                          {compareDocument.fileSize !== baseDocument.fileSize && (
                            <span className="ml-2">
                              {compareDocument.fileSize > baseDocument.fileSize ? (
                                <ArrowLeft className="inline h-3 w-3" />
                              ) : (
                                <ArrowRight className="inline h-3 w-3" />
                              )}
                              {formatFileSize(Math.abs(compareDocument.fileSize - baseDocument.fileSize))}
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(compareDocument.fileSize)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">업로더</TableCell>
                      <TableCell>{baseDocument.uploadedByName || "알 수 없음"}</TableCell>
                      <TableCell>{compareDocument.uploadedByName || "알 수 없음"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">업로드일</TableCell>
                      <TableCell>{formatDate(baseDocument.createdAt)}</TableCell>
                      <TableCell>{formatDate(compareDocument.createdAt)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">설명</TableCell>
                      <TableCell>{baseDocument.description || "-"}</TableCell>
                      <TableCell>{compareDocument.description || "-"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Diff View */}
          {isComparing && canShowDiff && (
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-4 h-full overflow-auto">
                <div className="h-full min-h-[400px]">
                  <ReactDiffViewer
                    oldValue={baseDocument?.description || "이전 버전 내용"}
                    newValue={compareDocument?.description || "새 버전 내용"}
                    splitView={true}
                    useDarkTheme={false}
                    leftTitle={`v${baseDocument?.version}`}
                    rightTitle={`v${compareDocument?.version}`}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Comparison */}
          {isComparing && isImageFile && (
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-4 h-full">
                <div
                  className="relative h-full flex items-center justify-center bg-muted rounded-lg"
                  data-testid="image-comparison-slider"
                >
                  <div className="grid grid-cols-2 gap-4 w-full h-full">
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="mb-2">
                        v{baseDocument?.version}
                      </Badge>
                      <Image
                        src={baseDocument?.storagePath || ""}
                        alt={`v${baseDocument?.version}`}
                        width={400}
                        height={300}
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="mb-2">
                        v{compareDocument?.version}
                      </Badge>
                      <Image
                        src={compareDocument?.storagePath || ""}
                        alt={`v${compareDocument?.version}`}
                        width={400}
                        height={300}
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unsupported File Type Message */}
          {isComparing && !canShowDiff && !isImageFile && (
            <Card className="flex-1">
              <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
                <FileText className="h-16 w-16 text-muted-foreground/30" />
                <p className="text-lg font-medium">내용 비교를 사용할 수 없습니다</p>
                <p className="text-sm text-muted-foreground">
                  이 파일 형식은 내용 비교를 지원하지 않습니다. 메타데이터만 비교됩니다.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoadingVersions && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">버전 정보를 불러오는 중...</p>
            </div>
          )}

          {/* No Versions Message */}
          {!isLoadingVersions && versions.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">비교할 버전이 없습니다</p>
            </div>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
