"use client";

import * as React from "react";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Change order status data point
 */
export interface ChangeOrderDataPoint {
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected" | "implemented";
  count: number;
  label: string;
  color: string;
}

/**
 * Change order chart component props
 */
interface ChangeOrderChartProps {
  /** Array of change order data points */
  data: ChangeOrderDataPoint[];
  /** Total count (calculated from data if not provided) */
  total?: number;
  /** Optional title */
  title?: string;
  /** Optional className */
  className?: string;
  /** Show percentage labels */
  showPercentage?: boolean;
  /** Layout type */
  layout?: "horizontal" | "vertical";
}

/**
 * Status configuration for styling
 */
const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  draft: {
    label: "초안",
    color: "bg-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  submitted: {
    label: "제출됨",
    color: "bg-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  in_review: {
    label: "검토 중",
    color: "bg-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900",
  },
  approved: {
    label: "승인됨",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900",
  },
  rejected: {
    label: "거부됨",
    color: "bg-rose-500",
    bgColor: "bg-rose-100 dark:bg-rose-900",
  },
  implemented: {
    label: "구현됨",
    color: "bg-green-500",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
};

/**
 * ChangeOrderChart Component
 * @description A bar chart visualization for change order status distribution
 */
export function ChangeOrderChart({
  data,
  total: propTotal,
  title = "변경 요청 현황",
  className,
  showPercentage = true,
  layout = "horizontal",
}: ChangeOrderChartProps) {
  const total = propTotal ?? data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </span>
          <Badge variant="secondary">총 {total}건</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "space-y-3",
            layout === "vertical" && "flex items-end justify-between gap-2 h-48"
          )}
        >
          {data.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

            return (
              <div
                key={item.status}
                className={cn(
                  "flex items-center gap-3",
                  layout === "vertical" && "flex-col flex-1"
                )}
              >
                {/* Label */}
                <div
                  className={cn(
                    "text-sm font-medium min-w-0 flex-shrink-0",
                    layout === "vertical" && "text-xs text-center mb-2"
                  )}
                  style={
                    layout === "horizontal"
                      ? { width: "70px" }
                      : undefined
                  }
                >
                  {item.label}
                </div>

                {/* Bar */}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "h-8 rounded-md flex items-center justify-center text-xs font-medium text-white transition-all duration-500",
                      statusConfig[item.status]?.color || "bg-gray-500"
                    )}
                    style={
                      layout === "horizontal"
                        ? { width: `${widthPercent}%` }
                        : { height: `${widthPercent}%`, minHeight: "8px" }
                    }
                  >
                    {item.count > 0 && item.count}
                  </div>
                </div>

                {/* Percentage */}
                {showPercentage && (
                  <div
                    className={cn(
                      "text-sm text-muted-foreground flex-shrink-0",
                      layout === "vertical" && "text-xs mt-1"
                    )}
                    style={
                      layout === "horizontal"
                        ? { width: "50px" }
                        : undefined
                    }
                  >
                    {percentage > 0 ? `${percentage.toFixed(0)}%` : "-"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {total === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              변경 요청 데이터가 없습니다
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact change order status summary
 */
interface ChangeOrderStatusSummaryProps {
  data: ChangeOrderDataPoint[];
  total?: number;
  className?: string;
}

export function ChangeOrderStatusSummary({
  data,
  total: propTotal,
  className,
}: ChangeOrderStatusSummaryProps) {
  const total = propTotal ?? data.reduce((sum, d) => sum + d.count, 0);

  // Calculate trends (placeholder logic)
  const approvedData = data.find((d) => d.status === "approved");
  const rejectedData = data.find((d) => d.status === "rejected");
  const hasTrendUp = (approvedData?.count || 0) > (rejectedData?.count || 0);

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {data.map((item) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const config = statusConfig[item.status] || statusConfig.draft;

        return (
          <div
            key={item.status}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              config.bgColor
            )}
          >
            <div
              className={cn("h-3 w-3 rounded-full", config.color)}
            />
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold">
                {item.count}
                <span className="text-xs text-muted-foreground ml-1">
                  ({percentage.toFixed(0)}%)
                </span>
              </p>
            </div>
          </div>
        );
      })}

      {/* Trend indicator */}
      {hasTrendUp && (
        <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs text-emerald-700 dark:text-emerald-300">
            승인 우위
          </span>
        </div>
      )}

      {!hasTrendUp && rejectedData && rejectedData.count > 0 && (
        <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-100 dark:bg-rose-900">
          <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <span className="text-xs text-rose-700 dark:text-rose-300">
            거부 증가
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Mini change order status indicator
 */
interface ChangeOrderMiniChartProps {
  data: ChangeOrderDataPoint[];
  className?: string;
}

export function ChangeOrderMiniChart({
  data,
  className,
}: ChangeOrderMiniChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={cn("flex h-2 rounded-full overflow-hidden", className)}>
      {data.map((item) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        const config = statusConfig[item.status] || statusConfig.draft;

        return (
          <div
            key={item.status}
            className={cn("h-full transition-all duration-500", config.color)}
            style={{ width: `${percentage}%` }}
            title={`${item.label}: ${item.count} (${percentage.toFixed(0)}%)`}
          />
        );
      })}
    </div>
  );
}
