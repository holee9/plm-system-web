"use client";

import * as React from "react";
import { Package, MoreHorizontal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Part category data point
 */
export interface PartCategoryDataPoint {
  category: string;
  count: number;
  color?: string;
}

/**
 * Part category chart component props
 */
interface PartCategoryChartProps {
  /** Array of category data points */
  data: PartCategoryDataPoint[];
  /** Total count (calculated from data if not provided) */
  total?: number;
  /** Optional title */
  title?: string;
  /** Optional className */
  className?: string;
  /** Maximum height for scrollable list */
  maxHeight?: string;
  /** Show percentages */
  showPercentage?: boolean;
}

/**
 * Default category colors
 */
const defaultCategoryColors: Record<number, string> = {
  0: "bg-blue-500",
  1: "bg-emerald-500",
  2: "bg-amber-500",
  4: "bg-purple-500",
  5: "bg-pink-500",
  6: "bg-cyan-500",
  7: "bg-indigo-500",
  8: "bg-rose-500",
  9: "bg-orange-500",
};

/**
 * Get color for category index
 */
function getCategoryColor(index: number, customColor?: string): string {
  if (customColor) return customColor;
  return defaultCategoryColors[index % Object.keys(defaultCategoryColors).length] || "bg-gray-500";
}

/**
 * PartCategoryChart Component
 * @description A bar chart visualization for part category distribution
 */
export function PartCategoryChart({
  data,
  total: propTotal,
  title = "부품 카테고리 분포",
  className,
  maxHeight = "300px",
  showPercentage = true,
}: PartCategoryChartProps) {
  const total = propTotal ?? data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </span>
          <Badge variant="secondary">총 {total}개</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="p-6 pt-0 space-y-4">
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  부품 데이터가 없습니다
                </p>
              </div>
            ) : (
              data.map((item, index) => {
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                const progressValue = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                const color = getCategoryColor(index, item.color);

                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={cn("h-3 w-3 rounded-full flex-shrink-0", color)}
                        />
                        <span className="font-medium truncate">{item.category || "미분류"}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-semibold">{item.count}</span>
                        {showPercentage && (
                          <span className="text-muted-foreground text-xs w-12 text-right">
                            {percentage > 0 ? `${percentage.toFixed(0)}%` : "0%"}
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress
                      value={progressValue}
                      className={cn("h-2", color.replace("bg-", "bg-").replace("500", "100"))}
                    />
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Compact category chips view
 */
interface PartCategoryChipsProps {
  data: PartCategoryDataPoint[];
  total?: number;
  maxChips?: number;
  className?: string;
}

export function PartCategoryChips({
  data,
  total: propTotal,
  maxChips = 8,
  className,
}: PartCategoryChipsProps) {
  const total = propTotal ?? data.reduce((sum, d) => sum + d.count, 0);
  const visibleData = data.slice(0, maxChips);
  const remainingCount = Math.max(0, data.length - maxChips);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleData.map((item, index) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const color = getCategoryColor(index, item.color);

        return (
          <Badge
            key={item.category}
            variant="secondary"
            className="gap-1.5 pr-3"
          >
            <div className={cn("h-2 w-2 rounded-full", color)} />
            <span>{item.category || "미분류"}</span>
            <span className="text-muted-foreground">
              {item.count} ({percentage.toFixed(0)}%)
            </span>
          </Badge>
        );
      })}

      {remainingCount > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge variant="outline" className="cursor-pointer">
              +{remainingCount} 더보기
              <MoreHorizontal className="h-3 w-3 ml-1" />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {data.slice(maxChips).map((item, index) => {
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              const color = getCategoryColor(maxChips + index, item.color);

              return (
                <DropdownMenuItem key={item.category} asChild>
                  <div className="flex items-center gap-2 w-full">
                    <div className={cn("h-2 w-2 rounded-full", color)} />
                    <span className="flex-1 truncate">{item.category || "미분류"}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/**
 * Mini donut chart representation using CSS conic-gradient
 */
interface PartCategoryDonutProps {
  data: PartCategoryDataPoint[];
  total?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function PartCategoryDonut({
  data,
  total: propTotal,
  size = 120,
  strokeWidth = 12,
  className,
}: PartCategoryDonutProps) {
  const total = propTotal ?? data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div
        className={cn("rounded-full border-4 border-muted", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  // Build conic-gradient string
  let gradientString = "";
  let currentAngle = 0;

  const gradients = data.map((item, index) => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    const endAngle = currentAngle + angle;
    const colorVar = getCategoryColor(index, item.color);

    // Extract color name without bg- prefix
    const colorName = colorVar.replace("bg-", "");

    // Map Tailwind color to CSS color (simplified)
    const colorMap: Record<string, string> = {
      "blue-500": "#3b82f6",
      "emerald-500": "#10b981",
      "amber-500": "#f59e0b",
      "purple-500": "#a855f7",
      "pink-500": "#ec4899",
      "cyan-500": "#06b6d4",
      "indigo-500": "#6366f1",
      "rose-500": "#f43f5e",
      "orange-500": "#f97316",
      "gray-500": "#6b7280",
    };

    const color = colorMap[colorName] || "#6b7280";

    const segment = `${color} ${currentAngle}deg ${endAngle}deg`;
    currentAngle = endAngle;

    return segment;
  });

  gradientString = `conic-gradient(${gradients.join(", ")})`;

  return (
    <div className={cn("relative", className)}>
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: gradientString,
        }}
      />
      {/* Inner circle for donut effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-full flex items-center justify-center"
        style={{
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
        }}
      >
        <div className="text-center">
          <p className="text-xs text-muted-foreground">총</p>
          <p className="text-lg font-bold">{total}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Legend for category colors
 */
interface PartCategoryLegendProps {
  data: PartCategoryDataPoint[];
  total?: number;
  className?: string;
}

export function PartCategoryLegend({
  data,
  total: propTotal,
  className,
}: PartCategoryLegendProps) {
  const total = propTotal ?? data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={cn("space-y-2", className)}>
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const color = getCategoryColor(index, item.color);

        return (
          <div key={item.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-full", color)} />
              <span>{item.category || "미분류"}</span>
            </div>
            <span className="text-muted-foreground">
              {item.count} ({percentage.toFixed(0)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
