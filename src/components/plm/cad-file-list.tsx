import {
  File,
  FileText,
  HardDrive,
  Download,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface CADFile {
  id: string;
  name: string;
  type: "cad" | "pcb" | "3d" | "pdf" | "doc";
  size: string;
  modified: string;
  thumbnail?: boolean;
}

interface CADFileListProps {
  files: CADFile[];
  onFileView?: (file: CADFile) => void;
  onFileDownload?: (file: CADFile) => void;
  className?: string;
}

const fileIcons = {
  cad: HardDrive,
  pcb: HardDrive,
  "3d": HardDrive,
  pdf: FileText,
  doc: FileText,
};

const fileColors = {
  cad: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  pcb: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  "3d": "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  pdf: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  doc: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
};

export function CADFileList({
  files,
  onFileView,
  onFileDownload,
  className,
}: CADFileListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <File className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No CAD files</p>
        </div>
      ) : (
        files.map((file) => {
          const FileIcon = fileIcons[file.type] || File;
          return (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md",
                  fileColors[file.type]
                )}
              >
                <FileIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{file.size}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{file.modified}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onFileDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onFileDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download {file.name}</span>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onFileView && (
                      <DropdownMenuItem onClick={() => onFileView(file)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                    )}
                    {onFileDownload && (
                      <DropdownMenuItem onClick={() => onFileDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
