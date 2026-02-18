/**
 * Export Dialog Component
 * Allows users to select export format and fields before exporting change orders
 */

"use client";

import * as React from "react";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getDefaultExportFields,
  getExportFieldConfigs,
  exportChangeOrders,
  type ExportFormat,
  type ExportField,
  type ChangeOrderWithDetails,
} from "@/modules/plm/export";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeOrders: ChangeOrderWithDetails[];
  title?: string;
}

type ExportTab = "format" | "fields";

export function ExportDialog({
  open,
  onOpenChange,
  changeOrders,
  title = "변경 주문 내보내기",
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>("csv");
  const [selectedFields, setSelectedFields] = React.useState<ExportField[]>(getDefaultExportFields());
  const [activeTab, setActiveTab] = React.useState<ExportTab>("format");
  const [isExporting, setIsExporting] = React.useState(false);

  const fieldConfigs = React.useMemo(() => getExportFieldConfigs(), []);

  // Reset selections when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedFormat("csv");
      setSelectedFields(getDefaultExportFields());
      setActiveTab("format");
    }
  }, [open]);

  const handleFieldToggle = (field: ExportField) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAllFields = () => {
    setSelectedFields(fieldConfigs.map((f) => f.key));
  };

  const handleDeselectAllFields = () => {
    setSelectedFields([]);
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      await exportChangeOrders(changeOrders, {
        format: selectedFormat,
        fields: selectedFields,
        includeHeader: true,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
      // TODO: Show error toast
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = selectedFields.length > 0 && !isExporting;
  const itemCount = changeOrders.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {itemCount}개의 변경 주문을 내보내기합니다. 형식과 필드를 선택하세요.
          </DialogDescription>
        </DialogHeader>

        {/* Format Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">내보내기 형식</Label>
            <p className="text-sm text-muted-foreground mt-1">
              파일 형식을 선택하세요
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedFormat("csv")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                "hover:bg-accent/50",
                selectedFormat === "csv"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <span className="font-semibold">CSV</span>
              <span className="text-xs text-muted-foreground">
                Excel 호환 스프레드시트
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat("pdf")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                "hover:bg-accent/50",
                selectedFormat === "pdf"
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <FileText className="h-8 w-8 text-red-600" />
              <span className="font-semibold">PDF</span>
              <span className="text-xs text-muted-foreground">
                인쇄용 문서
              </span>
            </button>
          </div>
        </div>

        <Separator />

        {/* Field Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">포함할 필드</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFields.length}개 필드 선택됨
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAllFields}
              >
                전체 선택
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDeselectAllFields}
              >
                전체 해제
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-4 space-y-2">
              {fieldConfigs.map((config) => (
                <div
                  key={config.key}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-accent/50"
                >
                  <Checkbox
                    id={`field-${config.key}`}
                    checked={selectedFields.includes(config.key)}
                    onCheckedChange={() => handleFieldToggle(config.key)}
                  />
                  <Label
                    htmlFor={`field-${config.key}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {config.label}
                  </Label>
                  {config.default && (
                    <span className="text-xs text-muted-foreground">(기본)</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            {isExporting ? "내보내는 중..." : "내보내기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
