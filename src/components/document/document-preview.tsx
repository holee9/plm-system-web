"use client";

/**
 * Document Preview Component
 * Renders PDF and image previews with zoom and navigation controls
 */
import * as React from "react";
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

// PDF.js worker configuration
if (typeof window !== "undefined") {
  import("pdfjs-dist").then(({ pdfjsLib }) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  });
}

interface DocumentPreviewProps {
  documentId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type ZoomLevel = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export function DocumentPreview({
  documentId,
  open: controlledOpen,
  onOpenChange,
}: DocumentPreviewProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [currentPage, setCurrentPage] = React.useState(1);
  const [zoom, setZoom] = React.useState<ZoomLevel>(1);
  const [pdfDoc, setPdfDoc] = React.useState<any>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Fetch document details
  const { data: document, isLoading } = trpc.document.getById.useQuery({
    documentId,
  });

  // Initialize PDF document
  React.useEffect(() => {
    if (document?.mimeType === "application/pdf" && open && canvasRef.current) {
      import("pdfjs-dist").then(async ({ pdfjsLib }) => {
        try {
          const loadingTask = pdfjsLib.getDocument(document.storagePath);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          renderPage(1, pdf, canvasRef.current!, zoom);
        } catch (error) {
          console.error("Failed to load PDF:", error);
          toast.error("PDF를 불러올 수 없습니다");
        }
      });
    }
  }, [document, open]);

  // Re-render when page or zoom changes
  React.useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(currentPage, pdfDoc, canvasRef.current, zoom);
    }
  }, [currentPage, zoom, pdfDoc]);

  const renderPage = async (
    pageNum: number,
    pdf: any,
    canvas: HTMLCanvasElement,
    zoomLevel: ZoomLevel
  ) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoomLevel });

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error("Failed to render page:", error);
    }
  };

  const handleZoomIn = () => {
    const zoomLevels: ZoomLevel[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const zoomLevels: ZoomLevel[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };

  const handleNextPage = () => {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDownload = async () => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPdf = document?.mimeType === "application/pdf";
  const isImage = document?.mimeType?.startsWith("image/");
  const canPreview = isPdf || isImage;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>문서 미리보기</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          {document && (
            <DialogDescription className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{document.originalFileName}</span>
                <Badge variant="outline">v{document.version}</Badge>
              </div>
              {document.description && (
                <p className="text-sm">{document.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatFileSize(document.fileSize)}</span>
                <span>{new Date(document.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </DialogDescription>
          )}
        </DialogHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          ) : !canPreview ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-lg font-medium">미리보기를 사용할 수 없습니다</p>
              <p className="text-sm text-muted-foreground">
                이 파일 형식은 미리보기를 지원하지 않습니다
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom === 0.5}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Badge variant="secondary" aria-label="Zoom level">
                    {Math.round(zoom * 100)}%
                  </Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom === 2}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                {isPdf && pdfDoc && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm" aria-label="Current page">
                      {currentPage} / {pdfDoc.numPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextPage}
                      disabled={currentPage === pdfDoc.numPages}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  다운로드
                </Button>
              </div>

              {/* Preview Area */}
              <div className="flex-1 overflow-auto border rounded-lg bg-muted/30 flex items-center justify-center">
                {isPdf && (
                  <canvas
                    ref={canvasRef}
                    className="shadow-lg"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                )}
                {isImage && document && (
                  <Image
                    src={document.storagePath}
                    alt={document.originalFileName}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
