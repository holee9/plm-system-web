"use client";

import * as React from "react";
import { Search, Package, Check, Loader2 } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
 * Affected part selector component props
 * @description Props for selecting affected parts in change orders
 */
interface AffectedPartSelectorProps {
  /** Project ID to fetch parts from */
  projectId: string;
  /** Currently selected part IDs */
  value: string[];
  /** Callback when selection changes */
  onChange: (partIds: string[]) => void;
  /** Optional disabled state */
  disabled?: boolean;
  /** Optional error message */
  error?: string;
  /** Optional maximum number of selectable parts */
  maxSelections?: number;
  /** Optional className */
  className?: string;
  /** Optional compact mode */
  compact?: boolean;
}

/**
 * Part display interface
 */
interface PartDisplay {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  status: "draft" | "active" | "obsolete";
}

/**
 * Status badge configuration
 */
const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "초안", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  active: { label: "활성", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  obsolete: { label: "폐기", className: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" },
};

/**
 * AffectedPartSelector Component
 * @description A searchable, multi-select component for choosing affected parts in change orders
 */
export function AffectedPartSelector({
  projectId,
  value,
  onChange,
  disabled = false,
  error,
  maxSelections,
  className,
}: AffectedPartSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch parts with search
  const { data: partsData, isLoading } = trpc.plm.part.list.useQuery(
    {
      projectId,
      query: debouncedQuery || undefined,
      limit: 50,
    },
    {
      enabled: !!projectId,
    }
  );

  const parts = partsData?.parts || [];

  // Toggle part selection
  const togglePart = (partId: string) => {
    if (disabled) return;

    const isSelected = value.includes(partId);
    let newValue: string[];

    if (isSelected) {
      newValue = value.filter((id) => id !== partId);
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Max selections reached
      }
      newValue = [...value, partId];
    }

    onChange(newValue);
  };

  // Select all visible parts
  const selectAllVisible = () => {
    if (disabled) return;
    const visibleIds = parts.map((p: any) => p.id);
    const newSelection = [...new Set([...value, ...visibleIds])];
    if (maxSelections) {
      onChange(newSelection.slice(0, maxSelections));
    } else {
      onChange(newSelection);
    }
  };

  // Deselect all
  const deselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const isMaxReached = maxSelections ? value.length >= maxSelections : false;
  const selectedCount = value.length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search and actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="부품 번호, 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={disabled}
          />
        </div>
        {selectedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={deselectAll}
            disabled={disabled}
          >
            모두 해제 ({selectedCount})
          </Button>
        )}
      </div>

      {/* Selection info */}
      {maxSelections && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            선택됨: {selectedCount} / {maxSelections}
          </span>
          {parts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAllVisible}
              disabled={disabled || isMaxReached}
              className="h-auto p-0 text-xs"
            >
              표시된 항목 모두 선택
            </Button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Parts list */}
      <Card className={cn(error && "border-destructive")}>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">로딩 중...</span>
              </div>
            ) : parts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
                {searchQuery ? (
                  <>
                    <p className="text-sm font-medium">검색 결과가 없습니다</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      다른 검색어를 시도해보세요
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">부품이 없습니다</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      이 프로젝트에 등록된 부품이 없습니다
                    </p>
                  </>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12 text-center">선택</TableHead>
                    <TableHead>부품 번호</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part: any) => {
                    const isSelected = value.includes(part.id);
                    const statusInfo = statusConfig[part.status] || statusConfig.draft;

                    return (
                      <TableRow
                        key={part.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected && "bg-muted/50",
                          disabled && "cursor-not-allowed opacity-50"
                        )}
                        onClick={() => togglePart(part.id)}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isSelected}
                            disabled={disabled || (!isSelected && isMaxReached)}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePart(part.id);
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {part.partNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{part.name}</p>
                            {part.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {part.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {part.category ? (
                            <Badge variant="outline" className="text-xs">
                              {part.category}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("text-xs", statusInfo.className)}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected parts summary */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => {
            const part = parts.find((p: any) => p.id === id);
            if (!part) return null;
            return (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 pr-2"
              >
                <span>{part.partNumber}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => togglePart(id)}
                    className="ml-1 hover:text-destructive"
                  >
                    x
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of AffectedPartSelector
 * Displays selected parts as a list with a button to open full selector
 */
interface AffectedPartSelectorCompactProps {
  /** Project ID to fetch parts from */
  projectId: string;
  /** Currently selected part IDs */
  value: string[];
  /** Callback when selection changes */
  onChange: (partIds: string[]) => void;
  /** Optional disabled state */
  disabled?: boolean;
}

export function AffectedPartSelectorCompact({
  projectId,
  value,
  onChange,
  disabled = false,
}: AffectedPartSelectorCompactProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Fetch selected parts details
  const selectedPartIds = value.slice(0, 5); // Only fetch first 5 for preview
  const { data: partsData } = trpc.plm.part.list.useQuery(
    {
      projectId,
      limit: 100,
    },
    {
      enabled: isOpen || value.length > 0,
    }
  );

  const selectedParts = partsData?.parts.filter((p: any) => value.includes(p.id)) || [];
  const remainingCount = Math.max(0, value.length - selectedParts.length);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedParts.slice(0, 3).map((part: any) => (
          <Badge key={part.id} variant="secondary" className="text-xs">
            {part.partNumber} - {part.name}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount} 더보기
          </Badge>
        )}
        {value.length === 0 && (
          <span className="text-sm text-muted-foreground">선택된 부품 없음</span>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {isOpen ? "닫기" : "부품 선택"}
      </Button>
      {isOpen && (
        <AffectedPartSelector
          projectId={projectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
